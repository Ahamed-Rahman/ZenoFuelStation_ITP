const mongoose = require('mongoose');

const supplierAuthSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});


const SupplierAuth = mongoose.model('SupplierAuth', supplierAuthSchema);
module.exports = SupplierAuth;