const mongoose = require('mongoose');

const homePageContentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    enum: ['hero', 'features', 'menuHighlights', 'gallery', 'catering', 'testimonials', 'newsletter', 'footer']
  },
  title: {
    type: String,
    required: false
  },
  subtitle: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  buttonText: {
    type: String,
    required: false
  },
  buttonLink: {
    type: String,
    required: false
  },
  items: [{
    name: String,
    title: String,
    role: String,
    description: String,
    price: String,
    image: String,
    alt: String
  }],
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomePageContent', homePageContentSchema);