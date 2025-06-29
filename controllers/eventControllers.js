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
      referredPatients = [],
      eventCode,
      medicalProfessionalsNeeded = [] // <-- Add this line
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
      eventCode,
      medicalProfessionalsNeeded // <-- Add this line
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
  
  try {
    const { nurseId, eventId, action = 'assign' } = req.body;

    // Validate input IDs
    if (!mongoose.Types.ObjectId.isValid(nurseId)) {
      return res.status(400).json({ success: false, message: 'Invalid nurse ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Transaction handling using withTransaction
    await session.withTransaction(async () => {
      const [event, nurse] = await Promise.all([
        Event.findById(eventId).session(session),
        User.findById(nurseId).session(session)
      ]);

      // Check event existence
      if (!event) throw new Error('Event not found');
      
      // Validate nurse
      if (!nurse || nurse.role !== 'nurse') {
        throw new Error('Invalid nurse or user is not a nurse');
      }

      // Check event status
      if (event.status !== "Accepted") {
        throw new Error('Only approved events can be assigned to nurses');
      }

      // Assignment logic
      if (action === 'assign') {
        if (event.assignedNurse) {
          throw new Error('Event is already assigned to another nurse');
        }
        // Add to nurse's assignments
        if (!nurse.assignedEvents.includes(eventId)) {
          nurse.assignedEvents.push(eventId);
        }
        event.assignedNurse = nurseId;
      } else if (action === 'unassign') {
        if (!event.assignedNurse?.equals(nurseId)) {
          throw new Error('Event not assigned to this nurse');
        }
        // Remove from nurse's assignments
        nurse.assignedEvents = nurse.assignedEvents.filter(id => !id.equals(eventId));
        event.assignedNurse = null;
      } else {
        throw new Error('Invalid action parameter');
      }

      // Save changes within the transaction
      await Promise.all([nurse.save({ session }), event.save({ session })]);
    });

    // After successful transaction, send email (if assigning)
    if (action === 'assign') {
      const nurse = await User.findById(nurseId); // Re-fetch if necessary or use previous data
      try {
        await sendEmail({
          to: nurse.email,
          subject: `New Event Assignment: ${event.eventName}`,
          // ... rest of email details
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    // Fetch updated data if necessary
    const updatedEvent = await Event.findById(eventId);
    const updatedNurse = await User.findById(nurseId);

    res.status(200).json({
      success: true,
      message: `Event ${action}ed successfully`,
      event: updatedEvent,
      nurse: updatedNurse
    });

  } catch (error) {
    // Determine appropriate status code
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  } finally {
    await session.endSession();
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
