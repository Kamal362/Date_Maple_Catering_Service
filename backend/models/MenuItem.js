const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  sizes: [{
    size: String,
    price: Number
  }],
  available: {
    type: Boolean,
    default: true
  },
  dietary: [{
    type: String,
    enum: ['vegan-friendly', 'vegetarian', 'gluten-free', 'dairy-free']
  }],
  altMilkOptions: [{
    type: String,
    enum: ['oat', 'almond', 'soy', 'coconut']
  }],
  coldFoamAvailable: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);