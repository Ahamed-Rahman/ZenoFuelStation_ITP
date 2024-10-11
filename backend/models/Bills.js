const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    customerName: String,
    customerContact: String,
    billDate: { type: Date, default: Date.now }, // Add date field
    items: [
        {
            itemId: mongoose.Schema.Types.ObjectId,
            itemName: String,
            retailPrice: Number,
            quantity: Number
        }
    ],
    totalAmount: Number
});

module.exports = mongoose.model('Bill', BillSchema);
