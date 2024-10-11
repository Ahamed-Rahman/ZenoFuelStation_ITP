const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
  fuelType: { 
    type: String, 
    required: true 
  },
  unitPrice: { 
    type: Number, 
    required: true 
  },
  litres: { 
    type: Number,
    required: true
  },
  totalPrice: { // Add this field
    type: Number,
    required: true
  },
  saleDate: { 
    type: Date, 
    default: Date.now  // Optional: to track when the sale was made
  }
});

module.exports = mongoose.model('Fuel', fuelSchema); // This is for sales made by workers
