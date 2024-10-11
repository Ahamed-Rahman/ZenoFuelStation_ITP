// models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  fuelType: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  litres: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema); // This is for price records
