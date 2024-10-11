// models/OrdersShop.js
const mongoose = require('mongoose');

const ordersShopSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantityOrdered: { type: Number, required: true },
    supplierEmail: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // Default status is 'pending'
    orderDate: { type: Date, default: Date.now }
}, { collection: 'OrdersShop' });


const OrdersShop = mongoose.model('OrdersShop', ordersShopSchema);
module.exports = OrdersShop;
