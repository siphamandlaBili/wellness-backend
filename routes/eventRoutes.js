import express from 'express';
import { 
  createEvent, 
  getEvents, 
  getEventDetails, 
  updateEventStatus,
  getUserEvents,
  getPastEvents
} from '../controllers/eventControllers.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createEvent);
router.get('/', protect, admin, getEvents);
router.get('/user-events', protect, getUserEvents);
router.get('/past-events',protect, getPastEvents);
router.get('/:id', protect, getEventDetails);
router.put('/:id/status', protect, admin, updateEventStatus);

export default router;