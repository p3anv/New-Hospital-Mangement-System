// src/controllers/appointmentController.js
const appointmentService = require('../services/appointmentService');
const doctorService = require('../services/doctorService');
const patientService = require('../services/patientService'); // <-- ADD THIS



exports.createAppointment = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.id || '000000000000000000000000' };
    const appointment = await appointmentService.createAppointment(data);
    if (req.accepts('html')) {
      return res.redirect(`/api/appointments`);
    }
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    if (req.accepts('html')) {
      // Re-fetch data to re-render the form with error
      const doctors = await doctorService.getAllDoctors();
      const patients = await patientService.getAllPatients();
      return res.status(400).render('appointments/booking', { 
        doctors, 
        patients, 
        user: req.user, 
        error: err.message 
      });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { patient, doctor, date } = req.query;
    const filter = {};
    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (date) filter.date = new Date(date);
    
    const appointments = await appointmentService.getAllAppointments(filter);
    if (req.accepts('html')) {
      return res.render('appointments/list', { appointments, user: req.user });
    }
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) return res.status(404).send('Appointment not found');
    if (req.accepts('html')) {
      return res.render('appointments/detail', { appointment, user: req.user });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id);
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await appointmentService.deleteAppointment(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// RENDER BOOKING FORM WITH BOTH DROPDOWNS
exports.showBookingForm = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    const patients = await patientService.getAllPatients();
    res.render('appointments/booking', { 
      doctors, 
      patients, 
      user: req.user, 
      error: null 
    });
  } catch (err) {
    res.status(500).send('Error loading form: ' + err.message);
  }
};