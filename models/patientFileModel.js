import mongoose from 'mongoose';

const patientFileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: String,
    surname: String,
    dateOfBirth: Date,
    idNumber: String,
    email: String,
    phone: String
  },
  medicalInfo: {
    bloodPressure: String,
    height: Number,
    weight: Number,
    bmi: Number,
    cholesterol: Number,
    hivStatus: String,
    glucoseLevel: Number,
    hba1c: Number
  },
  mentalHealthAssessment: [{
    question: String,
    answer: String
  }],
  consentSignature: String
}, { timestamps: true });

export const PatientFile = mongoose.model('PatientFile', patientFileSchema);