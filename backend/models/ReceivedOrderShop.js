const mongoose = require('mongoose');

// Define the schema for Shop Received Orders
const receivedOrderShopSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  wholesalePrice: { type: Number, required: true },
  totalAmount: { type: Number }, // Field to store total amount
  supplierEmail: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'AddedToInventory'], default: 'Pending' }, // Track status
  dateReceived: { type: Date, default: Date.now }, // The date the order was received
  orderDate: { type: Date }, // The original order date
});

const ReceivedOrderShop = mongoose.model('ReceivedOrderShop', receivedOrderShopSchema);
module.exports = ReceivedOrderShop;
