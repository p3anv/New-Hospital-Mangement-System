require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');  // <-- NEW
const flash = require('connect-flash');      // <-- NEW


// Import routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const medicalRecordRoutes = require('./src/routes/medicalRecordRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

// Import auth middleware
const { protect } = require('./src/middlewares/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
//  MIDDLEWARE
// ========================
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1);
// ---- SESSION & FLASH ----
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_here',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 minute – increase if needed
}));
app.use(flash());

// ---- MAKE FLASH & USER AVAILABLE TO ALL VIEWS ----
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// ========================
//  DATABASE CONNECTION
// ========================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_db')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ========================
//  ROUTES
// ========================
app.use('/auth', authRoutes);
app.get('/login', (req, res) => res.redirect('/auth/login'));
app.get('/register', (req, res) => res.redirect('/register'));

// ---- API ROUTES ----
app.use('/api/patients', protect, patientRoutes);
app.use('/api/doctors', protect, doctorRoutes);
app.use('/api/appointments', protect, appointmentRoutes);
app.use('/api/records', protect, medicalRecordRoutes);
app.use('/api/reports', protect, reportRoutes);


// ---- VIEW ROUTES ----
app.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});
app.get('/dashboard', protect, (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.get('/patients/new', protect, (req, res) => {
  res.render('patients/register', { user: req.user });
});

app.get('/appointments/new', protect, (req, res) => {
  res.redirect('/api/appointments/new');
});

// 👇 NEW: Patient "My Appointments" Portal
app.get('/my-appointments', protect, async (req, res) => {
  // Only patients can see this – we'll enforce in the route logic
  if (req.user.role !== 'patient') {
    req.flash('error', 'Access denied. Only patients can view this page.');
    return res.redirect('/dashboard');
  }
  // Import service dynamically to avoid circular deps
  const appointmentService = require('./src/services/appointmentService');
  const Patient = require('./src/models/Patient');
  
  // Find the patient record matching this user's email
  const patientRecord = await Patient.findOne({ email: req.user.email });
  if (!patientRecord) {
    req.flash('error', 'Patient profile not found. Please contact admin.');
    return res.redirect('/dashboard');
  }
  
  const appointments = await appointmentService.getAllAppointments({ patient: patientRecord._id });
  res.render('patients/my-appointments', { appointments, user: req.user, patient: patientRecord });
});

// ========================
//  404 & ERROR HANDLING
// ========================
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).send(`
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/dashboard">Go to Dashboard</a>
    `);
  }
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.accepts('html')) {
    return res.status(500).send(`
      <h1>500 - Server Error</h1>
      <p>Something went wrong on our end.</p>
      <pre>${err.message}</pre>
      <a href="/dashboard">Go to Dashboard</a>
    `);
  }
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
