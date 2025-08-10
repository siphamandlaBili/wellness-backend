import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkNurseAssignment } from '../middleware/checkNurseAssignment.js';
import { createAndPostPatientData,getPatientsByEvent,getSinglePatient } from '../controllers/patientControllers.js';
import { PatientFile } from '../models/patientFileModel.js';
const router = express.Router();


router.post('/', protect,checkNurseAssignment, createAndPostPatientData);

// Get patients for assigned event
router.get('/event/:eventId', protect,checkNurseAssignment,getPatientsByEvent);

// Get single patient (with assignment check)
router.get('/:id', protect, getSinglePatient);

router.get('/email/:email', protect, async (req, res) => {
  try {
    const { email } = req.params;

    // Find the patient file by nested personalInfo.email (case-insensitive)
    const patientFile = await PatientFile.findOne({ 'personalInfo.email': email.toLowerCase() })
      .populate('user', 'fullName email phone role image'); 
      // Select fields you want from User to return
    console.log(patientFile)
    if (!patientFile) {
      return res.status(404).json({ success: false, message: 'Patient file not found' });
    }

    res.status(200).json({ success: true, data: patientFile });
  } catch (error) {
    console.error('Error fetching patient file by email:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;