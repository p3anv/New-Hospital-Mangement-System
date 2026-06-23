// server.js - ENTRY POINT
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes (we'll mount them after middleware)
const patientRoutes = require('./src/routes/patientRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const medicalRecordRoutes = require('./src/routes/medicalRecordRoutes');
const reportRoutes = require('./src/routes/reportRoutes');


// Import auth middleware (adjust path if you have it elsewhere)
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

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Serve static files (optional)
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
// API routes (protected with auth)
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', medicalRecordRoutes);
app.use('/api/reports', reportRoutes); 
// Simple view routes (redirect to controllers that render EJS)
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res) => res.render('dashboard', { user: req.user || null }));

// Direct access to booking form (will be handled by appointment controller)
// But we already have a route in appointmentRoutes that handles '/new', so we can redirect
app.get('/appointments/new', (req, res) => res.redirect('/api/appointments/new'));

// Catch-all for 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// ========================
//  START SERVER
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});