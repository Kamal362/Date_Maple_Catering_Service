const mongoose = require('mongoose');

const eventFlyerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  flyerImage: {
    type: String, // Store file path or URL
    required: [true, 'Flyer image is required']
  },
  eventDate: {
    type: Date, // Date of the upcoming event
    required: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0, // Higher number means higher priority in display order
    min: 0,
    max: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventFlyer', eventFlyerSchema);