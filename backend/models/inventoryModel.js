const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const washinventory = new Schema({
  itemId: {
    type: String,
    required: true,
    unique: true, // Assuming each item has a unique ID
  },
  itemName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  wholesaleUnitPrice: {
    type: Number,
    required: true,
  },
  valueAddedPrice: {
    type: Number,
    required: true,
  },
});

const Inventory = mongoose.model('WashInventory', washinventory);

module.exports = Inventory;