import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { 
  sendEventCreateAlert, 
  eventAcceptedEmail, 
  eventRejectedEmail,
  eventCreatedConfirmation,
  nurseAssignedEmail
} from "../utils/EmailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";

// Helper function for safe email sending
const sendEmailSafely = async (to, subject, html) => {
  try {
    if (!to) return;
    await sendEmail({ to, subject, html });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
  }
};

// Create Event with email notifications
export const createEvent = asyncHandler(async (req, res) => {
  try {
    const {
      eventCode,
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      eventType,
      eventDate,
      venue,
      numberOfAttendees,
      additionalNotes,
      medicalProfessionalsNeeded,
      role
    } = req.body;

    // Validate required fields
    if (
      !eventCode ||
      !clientName ||
      !clientEmail ||
      !eventName ||
      !eventType ||
      !eventDate ||
      !venue ||
      !numberOfAttendees
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Create event
    const event = new Event({
      user: req.user._id,
      eventCode,
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      eventType,
      eventDate: new Date(eventDate),
      venue,
      numberOfAttendees: parseInt(numberOfAttendees),
      additionalNotes,
      medicalProfessionalsNeeded,
      status: 'Pending',
      role
    });

    const createdEvent = await event.save();
    
    // Add to user's created events
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdEvents: createdEvent._id }
    });

    // EMAIL 1: Confirmation to event creator
    const userConfirmationHtml = eventCreatedConfirmation(
      createdEvent.eventCode,
      createdEvent.eventName,
      createdEvent.eventDate,
      createdEvent.venue
    );
    await sendEmailSafely(
      req.user.email,
      `Event Created: ${createdEvent.eventName}`,
      userConfirmationHtml
    );

    // EMAIL 2: Notification to all admins/superadmins
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('email fullName');
    
    const adminNotificationHtml = sendEventCreateAlert(
      createdEvent.eventCode,
      createdEvent.eventName,
      createdEvent.venue,
      createdEvent.eventDate,
      req.user.fullName
    );
    
    for (const admin of admins) {
      await sendEmailSafely(
        admin.email,
        `New Event Requires Approval: ${createdEvent.eventName}`,
        adminNotificationHtml
      );
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: createdEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all events with role-based access
export const getEvents = asyncHandler(async (req, res) => {
  try {
    const { time } = req.query;
    let filter = {};
    const now = new Date();
    
    // Time filtering
    if (time === 'past') {
      filter.eventDate = { $lt: now };
    } else if (time === 'upcoming') {
      filter.eventDate = { $gte: now };
    }
    
    // Role-based filtering
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      // Admins see all events
    } else if (req.user.role === 'nurse') {
      // Nurses see assigned events
      filter.assignedNurse = req.user._id;
    } else {
      // Regular users see only their own events
      filter.user = req.user._id;
    }

    const events = await Event.find(filter)
      .populate('user', 'fullName email')
      .populate('assignedNurse', 'fullName')
      .sort({ eventDate: -1 });

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get events for the current user
export const getUserEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id })
      .populate('assignedNurse', 'fullName')
      .sort({ eventDate: -1 });

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single event by ID
export const getEventById = asyncHandler(async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }

    const event = await Event.findById(eventId)
      .populate('user', 'fullName email phone')
      .populate('assignedNurse', 'fullName email phone')
      .populate('referredPatients', 'personalInfo.fullName')
      .populate('registeredPatients', 'personalInfo.fullName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export const getAssignedNurseEvents = async (req, res) => {
  try {
    if (req.user.role !== 'nurse') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only nurses can view assigned events' 
      });
    }

    const events = await Event.find({ assignedNurse: req.user._id })
      .populate('user', 'fullName email phone')
      .sort('-eventDate');

    if (!events.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'No assigned events found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: events.length,
      events 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Assign/Unassign event to nurse with email notification
export const assignEventToNurse = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { nurseId, eventId, action = 'assign' } = req.body;

    // Validate input IDs
    if (!mongoose.Types.ObjectId.isValid(nurseId)) {
      return res.status(400).json({ success: false, message: 'Invalid nurse ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    let event, nurse;
    
    // Transaction handling
    await session.withTransaction(async () => {
      [event, nurse] = await Promise.all([
        Event.findById(eventId).session(session),
        User.findById(nurseId).session(session)
      ]);

      if (!event) throw new Error('Event not found');
      if (!nurse || nurse.role !== 'nurse') {
        throw new Error('Invalid nurse or user is not a nurse');
      }
      if (event.status !== "Accepted") {
        throw new Error('Only approved events can be assigned to nurses');
      }

      if (action === 'assign') {
        if (event.assignedNurse) {
          throw new Error('Event is already assigned to another nurse');
        }
        if (!nurse.assignedEvents.includes(eventId)) {
          nurse.assignedEvents.push(eventId);
        }
        event.assignedNurse = nurseId;
      } else if (action === 'unassign') {
        if (!event.assignedNurse?.equals(nurseId)) {
          throw new Error('Event not assigned to this nurse');
        }
        nurse.assignedEvents = nurse.assignedEvents.filter(id => !id.equals(eventId));
        event.assignedNurse = null;
      } else {
        throw new Error('Invalid action parameter');
      }

      await Promise.all([nurse.save({ session }), event.save({ session })]);
    });

    // Send assignment email
    if (action === 'assign' && nurse?.email) {
      const assignmentHtml = nurseAssignedEmail(
        event.eventCode,
        event.eventName,
        event.eventDate,
        event.venue,
        nurse.fullName
      );
      await sendEmailSafely(
        nurse.email,
        `New Event Assignment: ${event.eventName}`,
        assignmentHtml
      );
    }

    res.status(200).json({
      success: true,
      message: `Event ${action}ed successfully`,
      event,
      nurse
    });

  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  } finally {
    await session.endSession();
  }
};

// Update event with email notifications
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user', 'email fullName')
      .exec();

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    const { status, reason, invoiceItems } = req.body;

    // Validate status
    if (status && !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Allowed values: Accepted, Rejected' 
      });
    } 

    // Validate rejection
    if (status === 'Rejected') {
      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rejection reason must be at least 10 characters' 
        });
      }
      event.reason = reason;
    }

    // Validate acceptance
    if (status === 'Accepted') {
      if (!invoiceItems || !Array.isArray(invoiceItems) || invoiceItems.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'At least one invoice item is required for acceptance' 
        });
      }

      const invalidItems = invoiceItems.some(item => 
        !item.description?.trim() || !item.amount?.trim()
      );

      if (invalidItems) {
        return res.status(400).json({ 
          success: false, 
          message: 'All invoice items must have description and amount' 
        });
      }

      event.invoiceItems = invoiceItems;
    }

    // Update status if provided
    if (status) {
      event.status = status;
    }

    const updatedEvent = await event.save();

    // Send status emails
    if (['Accepted', 'Rejected'].includes(status)) {
      if (event.user?.email) {
        const emailContent = status === 'Accepted'
          ? eventAcceptedEmail(
              event.eventCode,
              event.eventName,
              event.venue,
              event.eventDate,
              event.invoiceItems
            )
          : eventRejectedEmail(
              event.eventCode,
              event.eventName,
              event.venue,
              event.eventDate,
              event.reason
            );

        await sendEmailSafely(
          event.user.email,
          `Event ${status}: ${event.eventName}`,
          emailContent
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Event ${status ? 'status updated' : 'updated'}`,
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// Delete event with email notification
export const deleteEvent = asyncHandler(async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Authorization check
    const canDelete = 
      req.user.role === 'admin' ||
      req.user.role === 'superadmin' ||
      event.user.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event"
      });
    }

    // Remove from nurse's assignments
    if (event.assignedNurse) {
      await User.findByIdAndUpdate(event.assignedNurse, {
        $pull: { assignedEvents: event._id }
      });
    }

    // Remove from owner's events
    await User.findByIdAndUpdate(event.user, {
      $pull: { createdEvents: event._id }
    });

    const eventName = event.eventName;
    const eventCode = event.eventCode;
    const creatorId = event.user;
    
    await event.deleteOne();

    // Send cancellation email
    const creator = await User.findById(creatorId);
    if (creator?.email) {
      await sendEmailSafely(
        creator.email,
        `Event Cancelled: ${eventName}`,
        `<div>
          <h1>Event Cancelled</h1>
          <p>Your event "${eventName}" (${eventCode}) has been cancelled.</p>
          <p>If this was a mistake, please contact support immediately.</p>
        </div>`
      );
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get events for dashboard
export const getDashboardEvents = asyncHandler(async (req, res) => {
  try {
    let events;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      events = await Event.find({
        eventDate: { $gte: thirtyDaysAgo, $lte: now }
      })
      .sort({ eventDate: -1 })
      .limit(5)
      .populate('assignedNurse', 'fullName');
    } else if (req.user.role === 'nurse') {
      events = await Event.find({
        assignedNurse: req.user._id,
        eventDate: { $gte: now }
      })
      .sort({ eventDate: 1 })
      .limit(5)
      .populate('user', 'fullName');
    } else {
      events = await Event.find({
        user: req.user._id,
        eventDate: { $gte: now }
      })
      .sort({ eventDate: 1 })
      .limit(5)
      .populate('assignedNurse', 'fullName');
    }

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get next event for nurse
export const getNurseNextEvent = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'nurse') {
      return res.status(400).json({
        success: false,
        message: "Only nurses can access this endpoint"
      });
    }

    const now = new Date();
    const event = await Event.findOne({
      assignedNurse: req.user._id,
      eventDate: { $gte: now }
    })
    .sort({ eventDate: 1 })
    .populate('user', 'fullName email phone')
    .populate('referredPatients', 'personalInfo.fullName')
    .populate('registeredPatients', 'personalInfo.fullName');

    if (!event) {
      return res.status(200).json({
        success: true,
        message: "No upcoming events found",
        event: null
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get past events
export const getPastEvents = asyncHandler(async (req, res) => {
  try {
    let filter = { eventDate: { $lt: new Date() } };
    
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      // Admins see all
    } else if (req.user.role === 'nurse') {
      filter.assignedNurse = req.user._id;
    } else {
      filter.user = req.user._id;
    }

    const events = await Event.find(filter)
      .sort({ eventDate: -1 })
      .populate('assignedNurse', 'fullName')
      .populate('user', 'fullName');

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});