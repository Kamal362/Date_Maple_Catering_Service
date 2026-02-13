const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  customer: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  eventType: {
    type: String,
    required: true,
    enum: ['baby_shower', 'general_party', 'bridal_party', 'business_event', 'community_event', 'other']
  },
  eventTypeOther: {
    type: String
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['catered', 'vended']
  },
  venueType: {
    type: String,
    required: true,
    enum: ['indoor', 'outdoor_with_power', 'outdoor_no_power']
  },
  guestCount: {
    type: String,
    required: true
  },
  estimatedBudget: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  drinkSelection: [{
    type: String
  }],
  altMilkNeeded: [{
    type: String,
    enum: ['oat', 'almond']
  }],
  coldFoamNeeded: {
    type: String,
    enum: ['yes', 'no']
  },
  foodSelection: [{
    type: String
  }],
  dietaryRestrictions: {
    type: String
  },
  specialRequests: {
    type: String
  },
  setupRequirements: {
    type: String
  },
  hearAboutUs: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);