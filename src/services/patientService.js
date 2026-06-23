const Patient = require('../models/Patient');

class PatientService {
  async createPatient(data) {
    const patient = new Patient(data);
    return await patient.save();
  }

  async getPatientById(id) {
    return await Patient.findById(id).populate('createdBy', 'name email');
  }

  async getAllPatients(query = {}) {
    return await Patient.find(query).sort({ createdAt: -1 });
  }

  async searchPatients(term) {
    return await Patient.find({ $text: { $search: term } });
  }

  async updatePatient(id, data) {
    return await Patient.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deletePatient(id) {
    return await Patient.findByIdAndDelete(id);
  }
}

module.exports = new PatientService();