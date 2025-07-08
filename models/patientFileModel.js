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
    fullName: { type: String, required: true },
    surname: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    idNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true }
  },
  medicalInfo: {
    bloodPressure: String,
    height: Number,
    weight: Number,
    bmi: Number,
    cholesterol: Number,
    hivStatus: { type: String, enum: ['Negative', 'Positive', 'Inconclusive'] },
    glucoseLevel: Number,
    glucoseType: { type: String, enum: ['Fasting', 'Random', 'Postprandial'] },
    hba1c: Number
  },
  mentalHealthAssessment: [{
    question: String,
    answer: String
  }],
  medicalAidDetails: {
    schemeName: String,
    planOption: String,
    membershipNumber: String,
    mainMemberNames: String,
    mainMemberAddress: String,
    dependentCode: String
  },
  consentSignature: String
}, { timestamps: true });

export const PatientFile = mongoose.model('PatientFile', patientFileSchema);