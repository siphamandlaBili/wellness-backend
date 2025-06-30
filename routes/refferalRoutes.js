import express from 'express';
import { Referral } from '../models/refferalModel.js';
import { PatientFile } from '../models/patientFileModel.js';
import  Event  from '../models/eventModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create referral using ID Number
router.post('/', protect, async (req, res) => {
  try {
    const { idNumber, eventId, practitionerName, practitionerEmail, comments } = req.body;

    // Validate input
    if (!idNumber || !eventId || !practitionerName || !practitionerEmail || !comments) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get patient and verify assignment
    const patient = await PatientFile.findOne({ 
      'personalInfo.idNumber': idNumber,
      event: eventId
    }).populate('event');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found in this event'
      });
    }

    if (patient.event.assignedNurse.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refer this patient'
      });
    }

    // Create referral
    const referral = await Referral.create({
      patientIdNumber: idNumber,
      referringNurse: req.user._id,
      event: eventId,
      practitionerName,
      practitionerEmail,
      comments
    });

    res.status(201).json({
      success: true,
      data: referral
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Updated get referrals by event route
router.get('/event/:eventId', protect, async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
  
      if (event.assignedNurse?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this event'
        });
      }
  
      // Get unique referrals with patient details
      const referrals = await Referral.aggregate([
        { $match: { event: event._id } },
        {
          $lookup: {
            from: 'patientfiles',
            let: { 
              patientIdNumber: "$patientIdNumber",
              eventId: "$event"
            },
            pipeline: [
              { 
                $match: { 
                  $expr: { 
                    $and: [
                      { $eq: ["$personalInfo.idNumber", "$$patientIdNumber"] },
                      { $eq: ["$event", "$$eventId"] }
                    ]
                  }
                }
              }
            ],
            as: 'patient'
          }
        },
        { $unwind: '$patient' },
        {
          $group: {
            _id: "$_id",
            practitionerName: { $first: "$practitionerName" },
            practitionerEmail: { $first: "$practitionerEmail" },
            comments: { $first: "$comments" },
            referralDate: { $first: "$referralDate" },
            status: { $first: "$status" },
            patient: { $first: "$patient" }
          }
        },
        {
          $project: {
            _id: 1,
            status: 1,
            comments: 1,
            referralDate: 1,
            practitionerName: 1,
            practitionerEmail: 1,
            patient: {
              name: { 
                $concat: [
                  '$patient.personalInfo.fullName', 
                  ' ', 
                  '$patient.personalInfo.surname'
                ]
              },
              idNumber: '$patient.personalInfo.idNumber',
              dob: '$patient.personalInfo.dateOfBirth'
            }
          }
        }
      ]);
  
      res.json({
        success: true,
        count: referrals.length,
        data: referrals
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  export default router;