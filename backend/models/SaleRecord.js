const mongoose = require('mongoose');

const SaleRecordSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopInventory', required: true },
    itemSold: { type: Number, required: true }, // This should store the quantity sold
    totalPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SaleRecord', SaleRecordSchema);
