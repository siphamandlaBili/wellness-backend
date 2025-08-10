import { PatientFile } from '../models/patientFileModel.js';
import  Event  from '../models/eventModel.js';
import  User  from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { calculateBMI } from '../utils/bmiCalc.js';
import { sendWelcomeEmail } from '../utils/EmailTemplate.js';
import { sendEmail } from '../utils/sendEmail.js';

export const getPatientsByEvent = async (req, res) => {
    try {
        // Ensure eventId is correctly accessed
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({ success: false, message: 'Event ID is required' });
        }

        const patients = await PatientFile.find({ event: eventId })
            .populate('event', 'eventName eventDate')
            .populate('nurse', 'fullName email');

        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getSinglePatient = async (req, res) => {
    try {
      const patient = await PatientFile.findById(req.params.id)
        .populate('event', 'assignedNurse');
        console.log(patient,req.params.id)
      if (!patient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Patient not found' 
        });
      }
  
      if (patient.event.assignedNurse.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to access this patient' 
        });
      }
  
      res.json({
        success: true,
        data: patient
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }



export const createAndPostPatientData = async (req, res) => {
    try {
        // Authorization check
        if (!['nurse', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create patients'
            });
        }

        const { 
            eventId, 
            personalInfo, 
            medicalInfo, 
            mentalHealthAssessment,
            medicalAidDetails 
        } = req.body;

        // Validate required fields
        if (!eventId || !personalInfo || !medicalInfo){
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        console.log(personalInfo)
        // Create patient user
        const user = new User({
            fullName: `${personalInfo.fullName} ${personalInfo.surname}`,
            email: personalInfo.email,
            phone: personalInfo.phone,
            password: hashedPassword,
            role: 'patient',
            passwordChangedAt: Date.now()
        });

        await user.save();

        // Validate mental health assessment format
        if (mentalHealthAssessment) {
            const isValidAssessment = mentalHealthAssessment.every(item =>
                item.question && item.answer
            );

            if (!isValidAssessment) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid mental health assessment format'
                });
            }
        }

        // Create patient file with user reference
        const patientFile = new PatientFile({
            user: user._id,
            event: eventId,
            nurse: req.user._id,
            personalInfo: {
                ...personalInfo,
                dateOfBirth: new Date(personalInfo.dateOfBirth)
            },
            mentalHealthAssessment,
            medicalInfo: {
                ...medicalInfo,
                bmi: calculateBMI(medicalInfo.height, medicalInfo.weight)
            },
            medicalAidDetails: medicalAidDetails || {}
        });

        await patientFile.save();

        // Update event
        await Event.findByIdAndUpdate(eventId, {
            $push: { registeredPatients: patientFile._id }
        });

        // Send welcome email with login credentials
        try {
            const emailContent = sendWelcomeEmail(
                `${personalInfo.fullName} ${personalInfo.surname}`,
                'patient',
                req.user.fullName,
                personalInfo.email,
                tempPassword
            );

            await sendEmail({
                to: personalInfo.email,
                subject: 'Your Patient Portal Access',
                html: emailContent
            });

            console.log('Welcome email sent successfully');
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the whole request if email fails
        }

        res.status(201).json({
            success: true,
            data: patientFile,
            // Only include temporary password in development for debugging
            tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};