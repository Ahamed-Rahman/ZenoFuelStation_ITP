// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  supplierEmail: { type: String, required: true },
  totalAmount: { type: Number, required: true }, // Added total amount field
  orderDate: { type: Date, required: true }, // Added order date field


  status: { type: String, default: 'Pending' }, // You can have statuses like 'Pending', 'Delivered', etc.
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
