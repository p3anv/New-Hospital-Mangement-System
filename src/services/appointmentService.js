const Appointment = require('../models/Appointment');

class AppointmentService {
  async createAppointment(data) {
    // Check for conflicts before saving
    const conflict = await this.checkConflict(data.doctor, data.date, data.startTime);
    if (conflict) {
      throw new Error('Doctor is already booked at this time. Please choose another slot.');
    }
    const appointment = new Appointment(data);
    return await appointment.save();
  }

  async checkConflict(doctorId, date, startTime) {
    // Find any existing appointment for this doctor on the same date and time
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: date,
      startTime: startTime,
      status: { $in: ['Scheduled', 'Checked-in'] } // Only active appointments count
    });
    return existing;
  }

  async getAppointmentById(id) {
    return await Appointment.findById(id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');
  }

  async getAllAppointments(query = {}) {
    return await Appointment.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ date: 1, startTime: 1 });
  }

  async updateAppointment(id, data) {
    // If changing doctor/time, re-check conflict (excluding itself)
    if (data.doctor || data.date || data.startTime) {
      const current = await Appointment.findById(id);
      const doctorId = data.doctor || current.doctor;
      const date = data.date || current.date;
      const startTime = data.startTime || current.startTime;
      
      const conflict = await Appointment.findOne({
        doctor: doctorId,
        date: date,
        startTime: startTime,
        _id: { $ne: id }, // Exclude itself
        status: { $in: ['Scheduled', 'Checked-in'] }
      });
      if (conflict) throw new Error('Time slot conflict with another appointment.');
    }
    return await Appointment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async cancelAppointment(id) {
    return await Appointment.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true });
  }

  async deleteAppointment(id) {
    return await Appointment.findByIdAndDelete(id);
  }
}

module.exports = new AppointmentService();