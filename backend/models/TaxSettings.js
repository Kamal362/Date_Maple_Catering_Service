const mongoose = require('mongoose');

const taxSettingsSchema = new mongoose.Schema({
  taxEnabled: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 8, // stored as percentage, e.g. 8 = 8%
    min: 0,
    max: 100
  },
  taxLabel: {
    type: String,
    default: 'Tax'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TaxSettings', taxSettingsSchema);
