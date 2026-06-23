const patientService = require('../services/patientService');

exports.createPatient = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user.id }; // req.user from auth middleware
    const patient = await patientService.createPatient(data);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let patients;
    if (search) patients = await patientService.searchPatients(search);
    else patients = await patientService.getAllPatients();
    // If request expects HTML (EJS), render, else JSON
    if (req.accepts('html')) {
      return res.render('patients/list', { patients, user: req.user });
    }
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    if (req.accepts('html')) {
      return res.render('patients/detail', { patient, user: req.user });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await patientService.deletePatient(req.params.id);
    res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};