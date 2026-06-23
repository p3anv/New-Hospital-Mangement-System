// seed.js - Complete Database Seeder (Run ONCE to populate everything)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import ALL models
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Doctor = require('./src/models/Doctor');
const Appointment = require('./src/models/Appointment');
const MedicalRecord = require('./src/models/MedicalRecord');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pranavDB:KnVfL87DQjrXME4u@cluster0.vx7hlnf.mongodb.net/';

// ============================================================
//  SEED DATA
// ============================================================

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // -------- 1. CLEAR EXISTING DATA (optional but clean) --------
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    console.log('✅ All collections cleared');

    // -------- 2. CREATE USERS (with different roles) --------
    console.log('👤 Creating users...');

    const adminUser = new User({
      name: 'Admin Hospital',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();

    const doctorUser1 = new User({
      name: 'Dr. Sarah Connor',
      email: 'dr.connor@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      isActive: true
    });
    await doctorUser1.save();

    const doctorUser2 = new User({
      name: 'Dr. House MD',
      email: 'dr.house@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      isActive: true
    });
    await doctorUser2.save();

    const receptionistUser = new User({
      name: 'Alice Reception',
      email: 'reception@hospital.com',
      password: 'reception123',
      role: 'receptionist',
      isActive: true
    });
    await receptionistUser.save();

    const patientUser = new User({
      name: 'John Doe Patient',
      email: 'john.patient@email.com',
      password: 'patient123',
      role: 'patient',
      isActive: true
    });
    await patientUser.save();

    console.log(`✅ Created ${await User.countDocuments()} users`);

    // -------- 3. CREATE DOCTORS (linked to doctor users) --------
    console.log('👨‍⚕️ Creating doctors...');

    const doctor1 = new Doctor({
      firstName: 'Sarah',
      lastName: 'Connor',
      specialization: 'Cardiology',
      email: 'dr.connor@hospital.com',
      phone: '+1-555-0101',
      availability: [
        { day: 'Monday', start: '09:00', end: '17:00' },
        { day: 'Tuesday', start: '09:00', end: '17:00' },
        { day: 'Thursday', start: '09:00', end: '17:00' }
      ],
      isActive: true
    });
    await doctor1.save();

    const doctor2 = new Doctor({
      firstName: 'Gregory',
      lastName: 'House',
      specialization: 'Neurology',
      email: 'dr.house@hospital.com',
      phone: '+1-555-0102',
      availability: [
        { day: 'Monday', start: '10:00', end: '18:00' },
        { day: 'Wednesday', start: '10:00', end: '18:00' },
        { day: 'Friday', start: '10:00', end: '18:00' }
      ],
      isActive: true
    });
    await doctor2.save();

    const doctor3 = new Doctor({
      firstName: 'Emily',
      lastName: 'Watson',
      specialization: 'Pediatrics',
      email: 'dr.watson@hospital.com',
      phone: '+1-555-0103',
      availability: [
        { day: 'Tuesday', start: '08:00', end: '16:00' },
        { day: 'Thursday', start: '08:00', end: '16:00' },
        { day: 'Saturday', start: '09:00', end: '13:00' }
      ],
      isActive: true
    });
    await doctor3.save();

    console.log(`✅ Created ${await Doctor.countDocuments()} doctors`);

    // -------- 4. CREATE PATIENTS (linked to patient user & admin) --------
    console.log('🧑‍🤝‍🧑 Creating patients...');

    const patient1 = new Patient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.patient@email.com',
      phone: '+1-555-1001',
      dob: new Date('1985-07-15'),
      gender: 'Male',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      },
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-2001'
      },
      createdBy: adminUser._id
    });
    await patient1.save();

    const patient2 = new Patient({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-1002',
      dob: new Date('1992-03-22'),
      gender: 'Female',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001'
      },
      emergencyContact: {
        name: 'Bob Smith',
        phone: '+1-555-2002'
      },
      createdBy: adminUser._id
    });
    await patient2.save();

    const patient3 = new Patient({
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@email.com',
      phone: '+1-555-1003',
      dob: new Date('1978-11-02'),
      gender: 'Male',
      address: {
        street: '789 Pine Ln',
        city: 'Chicago',
        state: 'IL',
        zip: '60601'
      },
      emergencyContact: {
        name: 'Mary Brown',
        phone: '+1-555-2003'
      },
      createdBy: receptionistUser._id
    });
    await patient3.save();

    const patient4 = new Patient({
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-1004',
      dob: new Date('1995-09-10'),
      gender: 'Female',
      address: {
        street: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zip: '77001'
      },
      emergencyContact: {
        name: 'Michael Davis',
        phone: '+1-555-2004'
      },
      createdBy: adminUser._id
    });
    await patient4.save();

    console.log(`✅ Created ${await Patient.countDocuments()} patients`);

    // -------- 5. CREATE APPOINTMENTS --------
    console.log('📅 Creating appointments...');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointment1 = new Appointment({
      patient: patient1._id,
      doctor: doctor1._id,
      date: tomorrow,
      startTime: '09:30',
      endTime: '10:00',
      reason: 'Annual heart checkup',
      status: 'Scheduled',
      notes: 'Patient has history of hypertension',
      createdBy: receptionistUser._id
    });
    await appointment1.save();

    const appointment2 = new Appointment({
      patient: patient2._id,
      doctor: doctor2._id,
      date: tomorrow,
      startTime: '11:00',
      endTime: '11:30',
      reason: 'Severe headache and dizziness',
      status: 'Scheduled',
      notes: 'Possible migraine, need MRI referral',
      createdBy: receptionistUser._id
    });
    await appointment2.save();

    const appointment3 = new Appointment({
      patient: patient3._id,
      doctor: doctor3._id,
      date: nextWeek,
      startTime: '14:00',
      endTime: '14:30',
      reason: 'Child vaccination and growth check',
      status: 'Scheduled',
      notes: 'Bring vaccination records',
      createdBy: receptionistUser._id
    });
    await appointment3.save();

    const appointment4 = new Appointment({
      patient: patient1._id,
      doctor: doctor2._id,
      date: new Date(today.setDate(today.getDate() - 5)), // 5 days ago (past appointment)
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Follow-up on previous MRI',
      status: 'Completed',
      notes: 'Results normal, schedule next checkup in 6 months',
      createdBy: doctorUser1._id
    });
    await appointment4.save();

    const appointment5 = new Appointment({
      patient: patient4._id,
      doctor: doctor1._id,
      date: new Date(today.setDate(today.getDate() - 3)), // 3 days ago (past)
      startTime: '15:30',
      endTime: '16:00',
      reason: 'Chest pain evaluation',
      status: 'Completed',
      notes: 'ECG normal, stress test scheduled',
      createdBy: doctorUser1._id
    });
    await appointment5.save();

    console.log(`✅ Created ${await Appointment.countDocuments()} appointments`);

    // -------- 6. CREATE MEDICAL RECORDS --------
    console.log('📋 Creating medical records...');

    const record1 = new MedicalRecord({
      patient: patient1._id,
      doctor: doctor1._id,
      visitDate: new Date('2026-01-15'),
      diagnosis: 'Hypertension Stage 2',
      prescription: [
        { medicine: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
        { medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }
      ],
      notes: 'Blood pressure 145/90. Advised lifestyle changes and low-sodium diet.',
      isFollowUp: false
    });
    await record1.save();

    const record2 = new MedicalRecord({
      patient: patient2._id,
      doctor: doctor2._id,
      visitDate: new Date('2026-01-10'),
      diagnosis: 'Migraine with Aura',
      prescription: [
        { medicine: 'Sumatriptan', dosage: '50mg', frequency: 'As needed (max 2/day)', duration: 'PRN' },
        { medicine: 'Propranolol', dosage: '20mg', frequency: 'Twice daily', duration: '90 days' }
      ],
      notes: 'Patient reports visual disturbances before headache. Trigger identified as caffeine.',
      isFollowUp: true
    });
    await record2.save();

    const record3 = new MedicalRecord({
      patient: patient3._id,
      doctor: doctor3._id,
      visitDate: new Date('2026-01-05'),
      diagnosis: 'Acute Bronchitis',
      prescription: [
        { medicine: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
        { medicine: 'Guaifenesin', dosage: '200mg', frequency: 'Every 4-6 hours', duration: '5 days' }
      ],
      notes: 'Productive cough with yellow sputum. Advised rest and hydration.',
      isFollowUp: false
    });
    await record3.save();

    const record4 = new MedicalRecord({
      patient: patient4._id,
      doctor: doctor1._id,
      visitDate: new Date('2026-01-20'),
      diagnosis: 'Anxiety Disorder',
      prescription: [
        { medicine: 'Sertraline', dosage: '50mg', frequency: 'Once daily', duration: '180 days' },
        { medicine: 'Lorazepam', dosage: '0.5mg', frequency: 'As needed (max 2/day)', duration: '30 days' }
      ],
      notes: 'Patient reports panic attacks. Referred to psychiatry for cognitive behavioral therapy.',
      isFollowUp: true
    });
    await record4.save();

    const record5 = new MedicalRecord({
      patient: patient1._id,
      doctor: doctor2._id,
      visitDate: new Date('2025-12-20'),
      diagnosis: 'Type 2 Diabetes',
      prescription: [
        { medicine: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '90 days' },
        { medicine: 'Glipizide', dosage: '5mg', frequency: 'Once daily before breakfast', duration: '90 days' }
      ],
      notes: 'HbA1c 7.8%. Referral to nutritionist for diet plan.',
      isFollowUp: false
    });
    await record5.save();

    console.log(`✅ Created ${await MedicalRecord.countDocuments()} medical records`);

    // ============================================================
    //  SUMMARY
    // ============================================================
    console.log('\n🎉 ========== SEEDING COMPLETE ==========');
    console.log(`👤 Users:          ${await User.countDocuments()}`);
    console.log(`👨‍⚕️ Doctors:        ${await Doctor.countDocuments()}`);
    console.log(`🧑‍🤝‍🧑 Patients:       ${await Patient.countDocuments()}`);
    console.log(`📅 Appointments:   ${await Appointment.countDocuments()}`);
    console.log(`📋 Medical Records: ${await MedicalRecord.countDocuments()}`);
    console.log('==========================================\n');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('  Admin:         admin@hospital.com / admin123');
    console.log('  Doctor:        dr.connor@hospital.com / doctor123');
    console.log('  Doctor:        dr.house@hospital.com / doctor123');
    console.log('  Receptionist:  reception@hospital.com / reception123');
    console.log('  Patient:       john.patient@email.com / patient123');
    console.log('\n✅ Server restart recommended.');

    process.exit(0);
  } catch (err) {
    console.error('❌ SEEDING ERROR:', err);
    process.exit(1);
  }
};

// ============================================================
//  RUN THE SEEDER
// ============================================================
seedData();