import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEventDetails, 
  updateEventStatus,
  getUserEvents,
  getPastEvents,
  assignEventToNurse,
  getAssignedNurseEvents,
  getEventsWithAssignments,
  getNurseNextEvent
} from '../controllers/eventControllers.js';


import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createEvent);
router.get('/', protect, admin, getEvents);
router.get('/user-events', protect, getUserEvents);
router.get('/past-events',protect, getPastEvents);
router.get('/:id', protect, getEventDetails);
router.put('/:id/status', protect, admin, updateEventStatus);
router.put('/assign-nurse', protect, admin, assignEventToNurse);
router.get('/nurse/assigned', protect, getAssignedNurseEvents);
router.get('/with-assignments', protect, admin, getEventsWithAssignments);
router.get('/nurse/next-event', protect, getNurseNextEvent);
export default router;