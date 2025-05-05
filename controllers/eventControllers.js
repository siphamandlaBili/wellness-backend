import { Event } from '../models/eventModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendEventCreateAlert,eventRejectedEmail,eventAcceptedEmail} from '../utils/EmailTemplate.js';
import mongoose from "mongoose";
import { User } from '../models/userModel.js';
import { PatientFile } from '../models/patientFileModel.js';


// create event/ event enquiry
export const createEvent = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only regular users can create events' 
      });
    }

    const { 
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      eventType,
      eventDate,
      eventLocation,
      numberOfAttendees,
      additionalNotes,
      referredPatients = [], // New field
      eventCode // Get eventCode from request body
    } = req.body;

    // Validate referred patients exist
    const existingPatients = await PatientFile.find({
      _id: { $in: referredPatients }
    });

    if (existingPatients.length !== referredPatients.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more referred patients not found'
      });
    }

    // Create event with referrals
    const event = await Event.create({
      user: user._id,
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      eventType,
      eventDate,
      eventLocation,
      numberOfAttendees,
      additionalNotes,
      referredPatients,
      eventCode
    });

    res.status(201).json({
      success: true,
      message: 'Event created',
      event: {
        ...event._doc,
        referredPatients: existingPatients.map(p => ({
          _id: p._id,
          name: `${p.personalInfo.fullName} ${p.personalInfo.surname}`,
          idNumber: p.personalInfo.idNumber
        }))
      }
    });

  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//get all events ,admin
export const getEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const events = await Event.find(filter)
      .populate('user', 'fullName email phone role')
      .sort('-createdAt');

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get event details, for each event
export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'referredPatients',
        select: 'personalInfo medicalInfo',
        populate: {
          path: 'nurse',
          select: 'fullName email'
        }
      })
      .populate('user', 'fullName email phone role');

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.status(200).json({
      success: true,
      event: {
        ...event._doc,
        referredPatients: event.referredPatients.map(p => ({
          _id: p._id,
          name: `${p.personalInfo.fullName} ${p.personalInfo.surname}`,
          idNumber: p.personalInfo.idNumber,
          nurse: p.nurse
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//update event status to rejected or accepted

export const updateEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user', 'email firstName lastName')
      .exec();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
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

    // Validate acceptance with invoice items
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

    // Send email notifications
    if (['Accepted', 'Rejected'].includes(status)) {
      try {
        if (!event.user?.email) {
          throw new Error('No associated user email found');
        }

        const emailContent = status === 'Accepted'
          ? eventAcceptedEmail(
              event.eventCode,
              event.eventName,
              event.eventLocation,
              event.eventDate,
              event.invoiceItems
            )
          : eventRejectedEmail(
              event.eventCode,
              event.eventName,
              event.eventLocation,
              event.eventDate,
              event.reason
            );

        await sendEmail({
          to: event.user.email,
          subject: `Event ${status}: ${event.eventName}`,
          text: `Your event "${event.eventName}" has been ${status.toLowerCase()}.`,
          html: emailContent,
        });

        console.log(`Notification email sent to ${event.user.email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // Consider adding failed email handling/retry logic here
      }
    }

    res.status(200).json({
      success: true,
      message: `Event ${status ? 'status updated' : 'updated'}`,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

//get specific user events
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id })
      .sort('-createdAt');

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get all past events
export const getPastEvents = async (req,res)=>{
 try {
  const pastEvents = await Event.find({ eventDate: { $lt: new Date() } })
  
  if(!pastEvents){
    return res.status(404).json({success:false,message:"no past events found"})
  }
 
  res.status(200).json({success:true,pastEvents})

 } catch (error) {
  res.status(404).json({success:false,message:error.message})
 }
}

//assign an event to a nurse
export const assignEventToNurse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { nurseId, eventId, action = 'assign' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(nurseId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid nurse ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const [event, nurse] = await Promise.all([
      Event.findById(eventId).session(session),
      User.findById(nurseId).session(session)
    ]);

    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (!nurse || nurse.role !== 'nurse') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid nurse or user is not a nurse' 
      });
    }

    if (event.status !== "Accepted") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: 'Only approved events can be assigned to nurses' 
      });
    }

    if (action === 'assign') {
      if (event.assignedNurse) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: 'Event is already assigned to another nurse' 
        });
      }

      if (!nurse.assignedEvents.includes(eventId)) {
        nurse.assignedEvents.push(eventId);
      }

      event.assignedNurse = nurseId;
    } else if (action === 'unassign') {
      if (!event.assignedNurse?.equals(nurseId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          success: false, 
          message: 'Event not assigned to this nurse' 
        });
      }

      nurse.assignedEvents = nurse.assignedEvents.filter(id => !id.equals(eventId));
      event.assignedNurse = null;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action parameter' 
      });
    }

    await Promise.all([
      nurse.save({ session }),
      event.save({ session })
    ]);

    await session.commitTransaction();
    session.endSession();

    if (action === 'assign') {
      try {
        await sendEmail({
          to: nurse.email,
          subject: `New Event Assignment: ${event.eventName}`,
          text: `You've been assigned to manage ${event.eventName} (${event.eventCode}).`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #2d3748;">New Event Assignment</h2>
              <p>You've been assigned to manage:</p>
              <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                <p><strong>Event:</strong> ${event.eventName}</p>
                <p><strong>Code:</strong> ${event.eventCode}</p>
                <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> ${event.eventLocation}</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Event ${action === 'assign' ? 'assigned to' : 'unassigned from'} nurse successfully`,
      event: {
        ...event.toObject(),
        assignedNurse: action === 'assign' ? {
          _id: nurse._id,
          fullName: nurse.fullName,
          email: nurse.email
        } : null
      },
      nurse: {
        _id: nurse._id,
        assignedEvents: nurse.assignedEvents
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during assignment operation' 
    });
  }
};

// Get events assigned to current nurse
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

// Get all events with assigned nurses (for admin)
export const getEventsWithAssignments = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('user', 'fullName email')
      .populate('assignedNurse', 'fullName email phone')
      .sort('-createdAt');

    const filteredEvents = events.filter(event => event.assignedNurse);

    res.status(200).json({ 
      success: true,
      count: filteredEvents.length,
      events: filteredEvents 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add to controllers/eventControllers.js
export const getNurseNextEvent = async (req, res) => {
  try {
    if (req.user.role !== 'nurse') {
      return res.status(403).json({
        success: false,
        message: 'Only nurses can access this endpoint'
      });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const nurseId = req.user._id;

    // Find closest upcoming or today's event
    const events = await Event.find({
      assignedNurse: nurseId,
      eventDate: { $gte: today }
    })
    .populate('user', 'fullName email phone')
    .sort('eventDate')
    .limit(1);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No upcoming events found'
      });
    }

    const event = events[0];
    const now = new Date();
    const isToday = event.eventDate.toDateString() === now.toDateString();

    res.status(200).json({
      success: true,
      event: {
        ...event._doc,
        timingStatus: isToday ? 'Happening Today' : 'Upcoming'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
