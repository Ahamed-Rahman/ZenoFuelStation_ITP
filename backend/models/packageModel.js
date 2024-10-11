const mongoose = require('mongoose');

const Schema=mongoose.Schema

const packageSchema = new Schema({
  packageName: {
    type: String,
    required: true,
  },
  packageDescription: {
    type: String,
    required: true,
  },
  services: [
    {
      type: String,
    },
  ],
  items: [
    {
      itemName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  packagePrice: {
    type: Number,
    required: true,
  },
  packageImage: {
    type: String, // URL or path to the image
  },
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
