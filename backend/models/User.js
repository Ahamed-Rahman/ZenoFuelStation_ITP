const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String},
  lastName: { type: String},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  contact: { type: String },
  accountNo: { type: String },
  bankDetails: { type: String },
  bankName: { type: String },
  role: { type: String, enum: ['Admin', 'Manager', 'Worker'], required: true },
  profilePhoto: { type: String, default: '/uploads/default-profile.png' }, // Default value
  basicSalary: { type: Number, default: 0 }  ,// New field for basic salary
  resetPasswordCode: { type: String },
  resetPasswordExpiry: { type: Date }
}, { collection: 'user' });

const User = mongoose.model('User', userSchema);

module.exports = User;
