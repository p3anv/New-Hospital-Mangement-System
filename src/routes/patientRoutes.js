const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth'); // assume these exist

// All routes need authentication; only receptionist/admin can create/update/delete
router.route('/')
  .get(protect, patientController.getPatients)
  .post(protect, authorize('admin', 'receptionist'), patientController.createPatient);

router.route('/:id')
  .get(protect, patientController.getPatientById)
  .put(protect, authorize('admin', 'receptionist', 'doctor'), patientController.updatePatient)
  .delete(protect, authorize('admin'), patientController.deletePatient);

module.exports = router;