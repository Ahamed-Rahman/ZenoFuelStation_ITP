const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const minimumPurchaseSchema = new Schema({
    amount: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('MinimumPurchase', minimumPurchaseSchema);