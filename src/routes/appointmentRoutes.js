const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');

// Public (authenticated) routes
router.get('/new', protect, appointmentController.showBookingForm); // View page
router.get('/', protect, appointmentController.getAppointments);
router.post('/', protect, appointmentController.createAppointment);

router.get('/:id', protect, appointmentController.getAppointmentById);
router.put('/:id', protect, authorize('admin', 'doctor', 'receptionist'), appointmentController.updateAppointment);
router.patch('/:id/cancel', protect, authorize('admin', 'doctor', 'receptionist', 'patient'), appointmentController.cancelAppointment);
router.delete('/:id', protect, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;