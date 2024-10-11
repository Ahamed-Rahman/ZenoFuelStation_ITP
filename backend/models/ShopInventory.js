const mongoose = require('mongoose');

const shopInventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    totalItems: { type: Number, default: 100 },
    itemsSold: { type: Number, default: 0 },
    quantityAvailable: { type: Number, default: 100 },
    purchasePrice: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    dateAdded: { type: Date, required: true },
    photo: { type: String },
}, { collection: 'ShopInventoryItem' });

// No pre-save hook necessary for your use case

module.exports = mongoose.model('ShopInventory', shopInventorySchema);
