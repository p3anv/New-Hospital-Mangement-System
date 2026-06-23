const medicalRecordService = require('../services/medicalRecordService');
const patientService = require('../services/patientService');

exports.createRecord = async (req, res) => {
  try {
    const data = { ...req.body, doctor: req.user.id }; // doctor is the logged-in user
    const record = await medicalRecordService.createRecord(data);
    if (req.accepts('html')) {
      return res.redirect(`/patients/${data.patient}`);
    }
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await medicalRecordService.getPatientHistory(patientId);
    const patient = await patientService.getPatientById(patientId);
    if (req.accepts('html')) {
      return res.render('records/history', { patient, records, user: req.user });
    }
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllRecords = async (req, res) => {
  try {
    const records = await medicalRecordService.getAllRecords();
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await medicalRecordService.updateRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    await medicalRecordService.deleteRecord(req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};