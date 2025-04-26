import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkNurseAssignment } from '../middleware/checkNurseAssignment.js';
import { createAndPostPatientData,getPatientsByEvent,getSinglePatient } from '../controllers/patientControllers.js';
const router = express.Router();


router.post('/', protect,checkNurseAssignment, createAndPostPatientData);

// Get patients for assigned event
router.get('/event/:eventId', protect,checkNurseAssignment,getPatientsByEvent);

// Get single patient (with assignment check)
router.get('/:id', protect, getSinglePatient);

export default router;