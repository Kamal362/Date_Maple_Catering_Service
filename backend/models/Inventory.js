const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ingredientName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  reorderLevel: {
    type: Number,
    required: true
  },
  supplier: {
    type: String,
    trim: true
  },
  costPerUnit: {
    type: Number,
    default: 0
  },
  lastRestocked: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);