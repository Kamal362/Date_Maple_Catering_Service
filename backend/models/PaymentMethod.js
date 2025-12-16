const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  vendor: {
    type: String,
    required: true,
    enum: ['Venmo', 'Cash App', 'Zelle']
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);