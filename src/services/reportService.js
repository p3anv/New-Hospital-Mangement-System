// src/services/reportService.js
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

class ReportService {
  /**
   * Generate a comprehensive patient report with visit history, diagnoses, and prescriptions
   * @param {string} patientId - MongoDB ObjectId of the patient
   * @param {string} startDate - optional ISO date string (YYYY-MM-DD)
   * @param {string} endDate - optional ISO date string (YYYY-MM-DD)
   * @returns {Object} - Patient info and summary statistics
   */
  async generatePatientReport(patientId, startDate, endDate) {
    // Ensure patientId is a valid ObjectId
    const matchStage = { patient: new mongoose.Types.ObjectId(patientId) };
    
    // Handle date filters with time boundaries
    if (startDate || endDate) {
      matchStage.visitDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchStage.visitDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.visitDate.$lte = end;
      }
    }

    console.log('🔍 Match stage:', JSON.stringify(matchStage, null, 2));

    // Aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      { 
        $lookup: { 
          from: 'doctors', 
          localField: 'doctor', 
          foreignField: '_id', 
          as: 'doctorInfo' 
        } 
      },
      { $unwind: '$doctorInfo' },
      { $sort: { visitDate: -1 } },
      { 
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          prescriptions: { $push: '$prescription' },
          diagnoses: { $push: '$diagnosis' },
          records: { $push: '$$ROOT' }
        }
      },
      { 
        $project: {
          totalVisits: 1,
          prescriptions: 1,
          diagnoses: 1,
          records: 1,
          allMedicines: { 
            $reduce: {
              input: '$prescriptions',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      }
    ];

    console.log('🔍 Aggregation pipeline:', JSON.stringify(pipeline, null, 2));

    const [result] = await MedicalRecord.aggregate(pipeline);
    const patient = await Patient.findById(patientId).select('firstName lastName email phone');

    // Return structured summary
    return {
      patient,
      summary: {
        totalVisits: result?.totalVisits || 0,
        diagnoses: result?.diagnoses || [],
        medicines: result?.allMedicines || [],
        records: result?.records || []
      }
    };
  }

  /**
   * Get visit statistics for all patients (admin dashboard)
   * @param {string} startDate - optional
   * @param {string} endDate - optional
   * @returns {Array} - List of patients with visit counts
   */
  async getPatientVisitStatistics(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.visitDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchStage.visitDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.visitDate.$lte = end;
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$patient',
          visitCount: { $sum: 1 },
          lastVisit: { $max: '$visitDate' }
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      { $unwind: '$patientInfo' },
      {
        $project: {
          patientName: { $concat: ['$patientInfo.firstName', ' ', '$patientInfo.lastName'] },
          visitCount: 1,
          lastVisit: 1
        }
      },
      { $sort: { visitCount: -1 } }
    ];

    return await MedicalRecord.aggregate(pipeline);
  }

  /**
   * Get appointment statistics grouped by status
   * @param {string} startDate - optional
   * @param {string} endDate - optional
   * @returns {Array} - Status counts
   */
  async getAppointmentStats(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchStage.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date.$lte = end;
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];
    return await Appointment.aggregate(pipeline);
  }
}

module.exports = new ReportService();