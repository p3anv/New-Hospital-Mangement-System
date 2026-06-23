const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  visitDate: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  prescription: [{
    medicine: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  notes: String,
  attachments: [String], // URLs to uploaded files
  isFollowUp: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);