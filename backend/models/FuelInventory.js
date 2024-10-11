const mongoose = require('mongoose');
const moment = require('moment');

const fuelInventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
    
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, 'Sold cannot be negative']
  },
  available: {
    type: Number,
    // No default here; calculate it dynamically
    min: [0, 'Available cannot be negative']
  },
  wholesalePrice: {
    type: Number,
    required: true
  },
  dateAdded: {
    type: Date,
    required: [true, 'Date added is required'],
    default: () => moment().startOf('day').toDate()  // Default to today’s date
  }
}, { timestamps: true });

// Middleware to adjust available stock and handle low stock alerts
fuelInventorySchema.pre('save', function (next) {
  if (this.isModified('total') || this.isModified('sold')) {
    this.available = this.total - this.sold;
  }

  if (this.available <= 0) {
    // Mark item as re-added if zero stock and already exists
    if (this.isNew) {
      this.itemName = `${this.itemName} (Re-added)`;
    }
  }

  if (this.available <= 20000) {
    if (global.io) {
      global.io.emit('lowStockAlert', { itemName: this.itemName, available: this.available });
    }
  }

  next();
});

module.exports = mongoose.model('FuelInventory', fuelInventorySchema);
