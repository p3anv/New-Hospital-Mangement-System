const MedicalRecord = require('../models/MedicalRecord');

class MedicalRecordService {
  async createRecord(data) {
    const record = new MedicalRecord(data);
    return await record.save();
  }

  async getRecordById(id) {
    return await MedicalRecord.findById(id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName specialization');
  }

  async getPatientHistory(patientId) {
    return await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'firstName lastName')
      .sort({ visitDate: -1 });
  }

  async getAllRecords(query = {}) {
    return await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ visitDate: -1 });
  }

  async updateRecord(id, data) {
    return await MedicalRecord.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteRecord(id) {
    return await MedicalRecord.findByIdAndDelete(id);
  }
}

module.exports = new MedicalRecordService();