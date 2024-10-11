// backend/models/SalaryManagement.js
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  username: { type: String, required: true },
  role: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  totalLeaves: { type: Number, required: true },
  finalSalary: { type: Number, required: true },
});

module.exports = mongoose.model('SalaryManagement', salarySchema);
