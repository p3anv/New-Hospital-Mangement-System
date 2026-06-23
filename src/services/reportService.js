const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

class ReportService {
  // Generate patient history summary with statistics
  async generatePatientReport(patientId, startDate, endDate) {
    const matchStage = { patient: patientId };
    if (startDate || endDate) {
      matchStage.visitDate = {};
      if (startDate) matchStage.visitDate.$gte = new Date(startDate);
      if (endDate) matchStage.visitDate.$lte = new Date(endDate);
    }

    // Aggregation pipeline to get records with grouped data
    const pipeline = [
      { $match: matchStage },
      { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doctorInfo' } },
      { $unwind: '$doctorInfo' },
      { $sort: { visitDate: -1 } },
      { $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          prescriptions: { $push: '$prescription' },
          diagnoses: { $push: '$diagnosis' },
          records: { $push: '$$ROOT' }
        }
      },
      { $project: {
          totalVisits: 1,
          prescriptions: 1,
          diagnoses: 1,
          records: 1,
          // flatten prescriptions for statistics
          allMedicines: { $reduce: {
              input: '$prescriptions',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            }
          }
        }
      }
    ];

    const [result] = await MedicalRecord.aggregate(pipeline);
    const patient = await Patient.findById(patientId).select('firstName lastName email phone');

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

  // Get all patients with visit counts (for admin dashboard)
  async getPatientVisitStatistics(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.visitDate = {};
      if (startDate) matchStage.visitDate.$gte = new Date(startDate);
      if (endDate) matchStage.visitDate.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchStage },
      { $group: {
          _id: '$patient',
          visitCount: { $sum: 1 },
          lastVisit: { $max: '$visitDate' }
        }
      },
      { $lookup: { from: 'patients', localField: '_id', foreignField: '_id', as: 'patientInfo' } },
      { $unwind: '$patientInfo' },
      { $project: {
          patientName: { $concat: ['$patientInfo.firstName', ' ', '$patientInfo.lastName'] },
          visitCount: 1,
          lastVisit: 1
        }
      },
      { $sort: { visitCount: -1 } }
    ];

    return await MedicalRecord.aggregate(pipeline);
  }

  // Appointment statistics (e.g., by doctor, by status)
  async getAppointmentStats(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchStage },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];
    return await Appointment.aggregate(pipeline);
  }
}

module.exports = new ReportService();