const mongoose = require("mongoose");

// Defining a model to receive incoming data and pass them in to the database
const Schema = mongoose.Schema;
const promoSchema = new Schema({

    promo_code : {
        type : String,
        required: true,  // Make sure the code is required
        unique: true   
    },

    promo_type : {
        type : String,
        enum: ['Percentage', 'Fixed'],
        required : true
    },

    promo_value : {
        type : Number,
        required : true
    },

    promo_startDate : {
        type : Date,
        required : true,
        get: v => v.toISOString().split('T')[0]
    },

    promo_endDate : {
        type : Date,
        required : true,
        get: v => v.toISOString().split('T')[0]
    },

    promo_expire : {
        type : Number,
        required : true
    },

    promo_expire : {
        type : Number,
        required : true
    }

})

const promo = mongoose.model("promotion",promoSchema);
module.exports = promo;