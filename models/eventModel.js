import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referredPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientFile'
  }],
  registeredPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientFile'
  }],
  timingStatus: String,
  eventCode: {
    type: String,
    required: true,
    unique: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventLocation: {
    type: String,
    required: true
  },
  numberOfAttendees: {
    type: Number,
    required: true
  },
  additionalNotes: String,
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  reason: String,
  invoiceItems: [{
    description: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    }
  }],
  medicalProfessionalsNeeded: {
    type: [String],
    enum: [
      'Registered Nurses',
      'Podiatrist',
      'Physio',
      'Massage Therapist',
      'Psychology',
      'Other'
    ],
    default: []
  }
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);
