const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: String, required: true },
  leaveType: { type: String, enum: ['Medical Leave', 'Casual Leave', 'Short Leave', 'Other Leave'], required: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  numberOfDays: { type: Number, required: true }, // New field to store the number of days
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Declined'], default: 'Pending' },
});

module.exports = mongoose.model('Leave', leaveSchema);
