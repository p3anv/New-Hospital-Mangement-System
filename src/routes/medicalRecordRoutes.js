const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(protect, authorize('admin', 'doctor'), medicalRecordController.getAllRecords)
  .post(protect, authorize('doctor'), medicalRecordController.createRecord);

router.get('/patient/:patientId', protect, authorize('admin', 'doctor'), medicalRecordController.getPatientHistory);

router.route('/:id')
  .put(protect, authorize('admin', 'doctor'), medicalRecordController.updateRecord)
  .delete(protect, authorize('admin'), medicalRecordController.deleteRecord);

module.exports = router;