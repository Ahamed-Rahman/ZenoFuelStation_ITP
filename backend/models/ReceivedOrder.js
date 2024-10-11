const mongoose = require('mongoose');

// Define the schema for Received Orders
const receivedOrderSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  wholesalePrice: { type: Number, required: true },
  totalAmount: { type: Number }, // Field to store total amount
  supplierEmail: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'AddedToInventory'], default: 'Pending' }, // Track status
  dateReceived: { type: Date, default: Date.now }, // The date the order was received
  orderDate: { type: Date }, // Add the missing orderDate field to match the frontend usage
});

// Create the model
const ReceivedOrder = mongoose.model('ReceivedOrder', receivedOrderSchema);

module.exports = ReceivedOrder;
