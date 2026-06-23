const reportService = require('../services/reportService');
const patientService = require('../services/patientService');

exports.showGenerator = async (req, res) => {
  const patients = await patientService.getAllPatients();
  res.render('reports/generator', { patients, user: req.user, reportData: null });
};

exports.generatePatientReport = async (req, res) => {
  try {
    const { patientId, startDate, endDate } = req.query;
    if (!patientId) {
      return res.status(400).send('Patient ID required');
    }
    const report = await reportService.generatePatientReport(patientId, startDate, endDate);
    // Render the same page with report data
    const patients = await patientService.getAllPatients();
    res.render('reports/generator', { patients, user: req.user, reportData: report });
  } catch (err) {
    res.status(500).send('Error generating report: ' + err.message);
  }
};

// API endpoint for JSON response
exports.getPatientReportJSON = async (req, res) => {
  try {
    const { patientId, startDate, endDate } = req.query;
    const report = await reportService.generatePatientReport(patientId, startDate, endDate);
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};