const mongoose = require('mongoose');

const shopSalesSchema = new mongoose.Schema({
    itemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ShopInventory', 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    finalPrice: { // New field to store the final price after discounts
        type: Number,
        required: false // Changed to optional
    },
    discountedPrice: { // New field to store the price before discounts
        type: Number,
        required: false // Changed to optional
    },
    saleDate: { 
        type: Date, 
        default: Date.now 
    },
    processed: { 
        type: Boolean, 
        default: false 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

const ShopSales = mongoose.model('ShopSales', shopSalesSchema);
module.exports = ShopSales;
