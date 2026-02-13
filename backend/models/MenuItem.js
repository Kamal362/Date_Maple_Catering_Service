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
    required: false
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
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free']
  }],
  altMilkOptions: [{
    type: String,
    enum: ['Oat Milk', 'Almond Milk', 'Soy Milk', 'Coconut Milk']
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