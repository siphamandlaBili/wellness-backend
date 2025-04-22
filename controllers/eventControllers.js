import { Event } from '../models/eventModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendEventCreateAlert} from '../utils/EmailTemplate.js';

export const createEvent = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only regular users can create events' });
    }

    const { clientName, clientEmail, clientPhone, eventName, eventType, eventDate, eventLocation, numberOfAttendees, additionalNotes } = req.body;

    // Generate unique event code
    let eventCode, isUnique = false;
    while (!isUnique) {
      const abbrev = eventType.slice(0, 2).toUpperCase().padEnd(2, 'X');
      const datePart = new Date(eventDate).toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      eventCode = `${abbrev}-${datePart}-${randomPart}`;

      const existingEvent = await Event.findOne({ eventCode });
      if (!existingEvent) isUnique = true;
    }

    const event = await Event.create({
      user: user._id,
      eventCode,
      clientName,
      clientEmail,
      clientPhone,
      eventName,
      eventType,
      eventDate,
      eventLocation,
      numberOfAttendees,
      additionalNotes
    });

    await sendEmail({
      to: 'azilebili@gmail.com',
      subject: 'new event',
      text: 'new event received',
      html: `${sendEventCreateAlert(event.eventCode,event.eventName,event.eventLocation,event.eventDate)}`,
  });
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: { ...event._doc, status: 'Pending' }
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

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

export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user', 'fullName email phone role');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && !event.user._id.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);


    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { status, reason } = req.body;

    if (status && !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Update status
    if (status) event.status = status;

    // If status is "Rejected", then reason is required
    if (status === 'Rejected') {
      if (!reason || reason.trim() === '') {
        return res.status(400).json({ success: false, message: 'Reason is required when rejecting an event' });
      }
      event.reason = reason;
    }

    if (status == "Accepted") {
      event.reason = "";
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event status updated',
      event: { ...event._doc, user: req.user._id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id })
      .sort('-createdAt');

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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