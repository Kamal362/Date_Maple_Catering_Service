const mongoose = require('mongoose');
const HomePageContent = require('../models/HomePageContent');
const connectDB = require('../config/db');

// Connect to database
connectDB();

const homePageContent = [
  {
    section: 'hero',
    title: 'Experience Authentic Coffees',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,',
    buttonText: 'Learn More',
    buttonLink: '/menu'
  },
  {
    section: 'features',
    title: 'Why Choose Date&Maple?',
    subtitle: 'We are committed to providing an exceptional dining experience with quality, freshness, and passion.',
    items: [
      {
        title: "Premium Ingredients",
        description: "We source only the finest ingredients to ensure exceptional taste in every bite and sip.",
        number: "01"
      },
      {
        title: "Fresh Daily",
        description: "Our menu items are prepared fresh daily to guarantee the highest quality and taste.",
        number: "02"
      },
      {
        title: "Expert Chefs",
        description: "Our team of skilled chefs brings creativity and expertise to every dish they prepare.",
        number: "03"
      }
    ]
  },
  {
    section: 'menuHighlights',
    title: 'Check Out Our Signature Menu',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,',
    buttonText: 'View Menu',
    buttonLink: '/menu'
  },
  {
    section: 'gallery',
    title: 'Coffee Gallery',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
  },
  {
    section: 'catering',
    title: 'Catering Services',
    subtitle: 'Elevate your next event with our exceptional catering services. From intimate gatherings to large corporate events, we provide delicious food and professional service that will impress your guests.',
    buttonText: 'Book an Event',
    buttonLink: '/events'
  },
  {
    section: 'testimonials',
    title: 'Customers Feedback',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
  },
  {
    section: 'newsletter',
    title: 'Subscribe Our Newsletter',
    subtitle: 'To receive monthly updates'
  }
];

const importData = async () => {
  try {
    // Clear existing data
    await HomePageContent.deleteMany();
    
    // Insert new data
    await HomePageContent.insertMany(homePageContent);
    
    console.log('Homepage content seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding homepage content:', error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await HomePageContent.deleteMany();
    console.log('Homepage content deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error deleting homepage content:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}