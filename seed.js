// seed.js - Run this ONCE to populate your database
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor');
const Patient = require('./src/models/Patient');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_db')
  .then(async () => {
    console.log('✅ Connected. Seeding data...');

    // Clear existing (optional)
    await Doctor.deleteMany({});
    await Patient.deleteMany({});

    // Create a test Doctor
    const doctor = await Doctor.create({
      firstName: 'John',
      lastName: 'Smith',
      specialization: 'Cardiology',
      email: 'dr.smith@hospital.com',
      phone: '123-456-7890',
      availability: [
        { day: 'Monday', start: '09:00', end: '17:00' },
        { day: 'Wednesday', start: '09:00', end: '17:00' }
      ],
      isActive: true
    });
    console.log(`✅ Doctor created: ${doctor.firstName} ${doctor.lastName}`);

    // Create a test Patient
    const patient = await Patient.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@email.com',
      phone: '987-654-3210',
      dob: new Date('1990-05-15'),
      gender: 'Female',
      address: { street: '123 Main St', city: 'Metropolis', state: 'NY', zip: '10001' },
      createdBy: new mongoose.Types.ObjectId() // fake ID for demo
    });
    console.log(`✅ Patient created: ${patient.firstName} ${patient.lastName}`);

    console.log('🎉 Seeding complete! Restart your server and refresh the booking page.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });