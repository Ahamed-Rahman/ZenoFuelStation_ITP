const mongoose = require("mongoose")

const Schema =mongoose.Schema

const washbill =new Schema({

    customerName:{
        type: String,
        required: true
    },
    billId:{
        type: String,
        required: true,
        unique: true
    },
    packageName:{
        type: String,
        required: true
    },
    packagePrice:{
        type: Number,
        required: true
    },
    Total:{
        type: Number,
        required: true
    },
    extraServices:[
        {
            serviceName:{
                type: String
            },
            servicePrice:{
                type: Number
            },
        },
    ],
    customerEmail: {
        type: String,
        required: true
    },
    createdDate:{
        type: Date,
        default: Date.now
    },
    items:[
        {
            itemName:{
                type: String,
                required: true
            },
            quantity:{
                type: Number,
                required: true
            },
        },
    ],


});
const Bill =mongoose.model("Washbill",washbill);

module.exports=Bill;