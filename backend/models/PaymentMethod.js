const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['digital_wallet', 'credit_card', 'bank_transfer', 'cash', 'other']
  },
  vendor: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    default: ''
  },
  accountAlias: {
    type: String,
    default: ''
  },
  // Credit card specific fields
  cardNumber: {
    type: String,
    default: ''
  },
  cardExpiry: {
    type: String,
    default: ''
  },
  cardCvv: {
    type: String,
    default: ''
  },
  // Additional settings
  description: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);