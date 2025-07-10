import express from 'express';
import { 
  createEvent, 
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getDashboardEvents,
  getNurseNextEvent, 
  getPastEvents,
  getUserEvents, // Added back
  assignEventToNurse,
  getAssignedNurseEvents
} from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { canAccessEvent } from '../middleware/eventAccess.js';

const router = express.Router();

router.post('/', protect, createEvent);
router.get('/', protect, getEvents);
router.get('/user-events', protect, getUserEvents); 
router.get('/dashboard', protect, getDashboardEvents);
router.get('/past', protect, getPastEvents);
router.get('/nurse/next', protect, getNurseNextEvent);
router.put('/assign-nurse', assignEventToNurse);
router.route('/:id')
  .get(protect, canAccessEvent, getEventById)
  .put(protect, updateEvent)
  .delete(protect, canAccessEvent, deleteEvent);

router.get('/nurse/assigned', protect, getAssignedNurseEvents);
export default router;