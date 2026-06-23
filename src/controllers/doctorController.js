const doctorService = require('../services/doctorService');

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    if (req.accepts('html')) {
      return res.redirect('/doctors');
    }
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    if (req.accepts('html')) {
      return res.render('doctors/list', { doctors, user: req.user });
    }
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    if (req.accepts('html')) {
      return res.render('doctors/detail', { doctor, user: req.user });
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await doctorService.deleteDoctor(req.params.id);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};