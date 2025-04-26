import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  patientIdNumber: {
    type: String,
    required: true,
    index: true
  },
  referringNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  practitionerName: {
    type: String,
    required: true
  },
  practitionerEmail: {
    type: String,
    required: true
  },
  referralDate: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }
}, { timestamps: true });

export const Referral = mongoose.model('Referral', referralSchema);