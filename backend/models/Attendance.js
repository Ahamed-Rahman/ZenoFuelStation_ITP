const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: String, enum: ['Manager', 'Worker'], required: true },
  date: { type: Date, required: true },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  attendanceStatus: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present', // Default status is Present unless marked as Absent
  },
} ,{ timestamps: true });

// Ensure that a user can only have one attendance record per day
attendanceSchema.index({ username: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
