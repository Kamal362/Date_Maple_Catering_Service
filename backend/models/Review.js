const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest reviews
  },
  // Guest review fields
  isGuestReview: {
    type: Boolean,
    default: false
  },
  guestEmail: {
    type: String,
    required: false
  },
  guestName: {
    type: String,
    required: false
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure either menuItem or order is provided
reviewSchema.pre('validate', function(next) {
  if (!this.menuItem && !this.order) {
    next(new Error('Either menuItem or order must be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Review', reviewSchema);