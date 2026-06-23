const reportService = require('../services/reportService');
const patientService = require('../services/patientService');
const doctorService = require('../services/doctorService');
const medicalRecordService = require('../services/medicalRecordService');
const PDFDocument = require('pdfkit');

// Show the report generator with doctor pre-selected
exports.showGenerator = async (req, res) => {
  try {
    const patients = await patientService.getAllPatients();
    const doctors = await doctorService.getAllDoctors();
    
    let loggedInDoctor = null;
    if (req.user.role === 'doctor') {
      loggedInDoctor = await doctorService.getDoctorByEmail(req.user.email);
    }
    
    // Pass empty strings for date filters initially
    res.render('reports/generator', { 
      patients, 
      doctors,
      loggedInDoctor,
      user: req.user, 
      reportData: null,
      startDate: '',
      endDate: '',
      error: null,
      success: null
    });
  } catch (err) {
    res.status(500).send('Error loading form: ' + err.message);
  }
};

// Generate report with optional new record creation
exports.generatePatientReport = async (req, res) => {
  try {
    console.log('🔍 FULL QUERY PARAMS:', req.query);
    
    const patientId = req.query.patientId || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';
    const diagnosis = req.query.diagnosis || '';
    const notes = req.query.notes || '';

    console.log('📋 Patient ID:', patientId);
    console.log('📋 Diagnosis:', diagnosis);
    console.log('👤 User Role:', req.user.role);

    if (!patientId) {
      req.flash('error', 'Patient ID required');
      return res.redirect('/api/reports/generator');
    }

    // ----- RECORD CREATION -----
    if (diagnosis && diagnosis.trim() && req.user.role === 'doctor') {
      console.log('🔄 Attempting to create record...');
      
      const doctor = await doctorService.getDoctorByEmail(req.user.email);
      console.log('👨‍⚕️ Found doctor:', doctor ? `${doctor.firstName} ${doctor.lastName}` : 'NOT FOUND');
      
      if (!doctor) {
        req.flash('error', 'Doctor profile not found. Please contact admin.');
        return res.redirect('/api/reports/generator');
      }

      // Collect prescription fields
      const prescriptionArray = [];
      let i = 0;
      while (req.query[`prescription_medicine_${i}`]) {
        const medicine = req.query[`prescription_medicine_${i}`] || '';
        const dosage = req.query[`prescription_dosage_${i}`] || '';
        const frequency = req.query[`prescription_frequency_${i}`] || '';
        const duration = req.query[`prescription_duration_${i}`] || '';
        if (medicine.trim()) {
          prescriptionArray.push({
            medicine: medicine.trim(),
            dosage: dosage.trim() || 'N/A',
            frequency: frequency.trim() || 'N/A',
            duration: duration.trim() || 'N/A'
          });
        }
        i++;
      }
      
      console.log('💊 Prescriptions collected:', prescriptionArray);

      // Create the record
      const newRecord = await medicalRecordService.createRecord({
        patient: patientId,
        doctor: doctor._id,
        diagnosis: diagnosis.trim(),
        prescription: prescriptionArray,
        notes: notes || '',
        visitDate: new Date()
      });
      
      console.log('✅ Record created with ID:', newRecord._id);
      req.flash('success', '✅ New medical record created successfully!');
    } else {
      console.log('⏭️ Skipping record creation - diagnosis empty or not doctor');
    }

    // ----- GENERATE REPORT -----
    console.log('📊 Generating report for patient:', patientId);
    const report = await reportService.generatePatientReport(patientId, startDate, endDate);
    console.log('📊 Total visits found:', report.summary.totalVisits);

    // Re-fetch data for the form
    const patients = await patientService.getAllPatients();
    const doctors = await doctorService.getAllDoctors();
    let loggedInDoctor = null;
    if (req.user.role === 'doctor') {
      loggedInDoctor = await doctorService.getDoctorByEmail(req.user.email);
    }

    res.render('reports/generator', {
      patients,
      doctors,
      loggedInDoctor,
      user: req.user,
      reportData: report,
      startDate: startDate,
      endDate: endDate,
      error: null,
      success: req.flash('success') || null
    });
  } catch (err) {
    console.error('❌ REPORT ERROR:', err);
    req.flash('error', err.message);
    res.redirect('/api/reports/generator');
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

// PDF download
exports.downloadPatientReportPDF = async (req, res) => {
  try {
    const { patientId, startDate, endDate } = req.query;
    if (!patientId) {
      return res.status(400).send('Patient ID required');
    }
    
    const report = await reportService.generatePatientReport(patientId, startDate, endDate);
    const patient = report.patient;
    const summary = report.summary;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=patient-report-${patient.firstName}-${patient.lastName}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('🏥 Hospital Management System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Patient Report: ${patient.firstName} ${patient.lastName}`, { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Email: ${patient.email}`);
    doc.text(`Phone: ${patient.phone}`);
    doc.text(`Total Visits: ${summary.totalVisits}`);
    doc.moveDown();

    doc.fontSize(14).text('Diagnoses:', { underline: true });
    summary.diagnoses.forEach(d => {
      doc.fontSize(12).text(`- ${d}`);
    });
    doc.moveDown();

    doc.fontSize(14).text('Prescribed Medicines:', { underline: true });
    summary.medicines.forEach(m => {
      doc.fontSize(12).text(`- ${m.medicine} (${m.dosage}) - ${m.frequency}`);
    });
    doc.moveDown();

    doc.fontSize(14).text('Visit Details:', { underline: true });
    summary.records.forEach(r => {
      const date = new Date(r.visitDate).toDateString();
      const doctor = `Dr. ${r.doctorInfo.firstName} ${r.doctorInfo.lastName}`;
      doc.fontSize(12).text(`📅 ${date} | 👨‍⚕️ ${doctor} | 💊 ${r.diagnosis}`);
    });

    doc.end();
  } catch (err) {
    console.error('PDF Error:', err);
    res.status(500).send('Error generating PDF');
  }
};