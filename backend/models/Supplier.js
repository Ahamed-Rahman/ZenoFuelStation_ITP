const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
}, { collection: 'Suppliers' }); // Explicitly specify the collection name

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
