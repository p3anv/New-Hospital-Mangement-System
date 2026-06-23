const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { street: String, city: String, state: String, zip: String },
  emergencyContact: { name: String, phone: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // who registered
}, { timestamps: true });

// Index for search
patientSchema.index({ firstName: 'text', lastName: 'text', email: 1 });

module.exports = mongoose.model('Patient', patientSchema);