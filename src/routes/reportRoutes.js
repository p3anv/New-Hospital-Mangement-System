const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/auth');

// View route to show the generator form
router.get('/generator', protect, authorize('admin', 'doctor'), reportController.showGenerator);

// Generate report (POST or GET with query params)
router.get('/patient', protect, authorize('admin', 'doctor'), reportController.generatePatientReport);

// API endpoint for JSON
router.get('/api/patient', protect, authorize('admin', 'doctor'), reportController.getPatientReportJSON);

module.exports = router;