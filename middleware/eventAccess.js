import Event from '../models/eventModel.js';
import asyncHandler from 'express-async-handler';

export const canAccessEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.eventId;
  const event = await Event.findById(eventId).populate('user', 'id');
  
  if (!event) {
    return res.status(404).json({ 
      success: false, 
      message: 'Event not found' 
    });
  }
  
  // Allow event organizer, assigned nurse, admins
  if (
    req.user.role === 'admin' || 
    req.user.role === 'superadmin' ||
    (event.assignedNurse && event.assignedNurse.toString() === req.user.id) ||
    (event.user && event.user.id.toString() === req.user.id)
  ) {
    return next();
  }
  
  res.status(403).json({ 
    success: false, 
    message: 'Not authorized to access this event' 
  });
});