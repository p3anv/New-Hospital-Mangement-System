const Doctor = require('../models/Doctor');

class DoctorService {
  async createDoctor(data) { return await new Doctor(data).save(); }
  async getDoctorById(id) { return await Doctor.findById(id); }
  async getAllDoctors() { return await Doctor.find({ isActive: true }); }
  async updateDoctor(id, data) { return await Doctor.findByIdAndUpdate(id, data, { new: true }); }
  async deleteDoctor(id) { return await Doctor.findByIdAndUpdate(id, { isActive: false }); }
  
  // For appointment conflict check
  async getDoctorAvailability(doctorId, date) {
    const doctor = await Doctor.findById(doctorId);
    // Return availability for that day (implementation based on your schedule)
    return doctor.availability;
  }

  // Add this method to the DoctorService class
async getDoctorByEmail(email) {
  return await Doctor.findOne({ email });
}
}



module.exports = new DoctorService();