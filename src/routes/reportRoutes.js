const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');

// View route to show the generator form
router.get('/generator', protect, authorize('admin', 'doctor'), reportController.showGenerator);

// Generate report (GET with query params – can also accept POST for record creation)
router.get('/patient', protect, authorize('admin', 'doctor'), reportController.generatePatientReport);
router.post('/patient', protect, authorize('doctor'), reportController.generatePatientReport);

// API endpoint for JSON
router.get('/api/patient', protect, authorize('admin', 'doctor'), reportController.getPatientReportJSON);

// PDF download
router.get('/download', protect, authorize('admin', 'doctor'), reportController.downloadPatientReportPDF);

module.exports = router;