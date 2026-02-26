const mongoose = require('mongoose');
const HomePageContent = require('../models/HomePageContent');
require('dotenv').config();

const defaultContent = [
  {
    section: 'hero',
    title: 'Experience Authentic Coffees',
    subtitle: 'Discover the finest selection of premium coffees and teas, carefully curated for the perfect sip every time.',
    buttonText: 'Explore Menu',
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
    subtitle: 'Discover our carefully crafted selection of premium coffees, teas, and delicious pastries.',
    buttonText: 'View Full Menu',
    buttonLink: '/menu'
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
    title: 'What Our Customers Say',
    subtitle: 'Read genuine feedback from our valued customers about their experiences.',
    items: [
      {
        name: "Justyna Helen",
        role: "Coffee Lover",
        description: "The best coffee shop in town! The atmosphere is amazing and the staff is incredibly friendly."
      },
      {
        name: "Fajar Siddiq",
        role: "Regular Customer",
        description: "I come here every morning for my daily dose of caffeine. Consistently excellent quality!"
      },
      {
        name: "Rob Hope",
        role: "Food Enthusiast",
        description: "Their pastries are to die for! Perfect pairing with their signature lattes."
      }
    ]
  },
  {
    section: 'newsletter',
    title: 'Subscribe to Our Newsletter',
    subtitle: 'Stay updated with our latest offerings, events, and exclusive promotions.',
    buttonText: 'Subscribe'
  },
  {
    section: 'gallery',
    title: 'Our Gallery',
    subtitle: 'Take a visual journey through our cozy atmosphere and delicious offerings.',
    items: [
      { title: 'Coffee Art', description: 'Beautiful latte art crafted by our skilled baristas' },
      { title: 'Fresh Pastries', description: 'Daily baked goods made with love' },
      { title: 'Cozy Ambiance', description: 'The perfect spot to relax and unwind' },
      { title: 'Premium Beans', description: 'Sourced from the finest coffee regions' }
    ]
  },
  {
    section: 'contact',
    title: 'Get In Touch',
    subtitle: 'We would love to hear from you. Reach out to us for any inquiries, feedback, or just to say hello!',
    settings: {
      address: '123 Coffee Street, Tea City',
      phone: '(123) 456-7890',
      email: 'info@datemaple.com',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133404672!2d-73.987574724525!3d40.758028871388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1690000000000!5m2!1sen!2sus',
      mondayFriday: '08.00 A.M - 10.00 P.M',
      saturday: '08.00 A.M - 02.00 P.M',
      sunday: 'Closed',
      halfHolidays: '08.00 A.M - 02.00 P.M'
    }
  },
  {
    section: 'footer',
    title: 'Date&Maple',
    subtitle: 'All rights reserved.',
    description: 'Crafting exceptional culinary experiences with passion and precision.',
    settings: {
      facebookUrl: '#',
      instagramUrl: '#',
      twitterUrl: '#',
      address: '123 Coffee Street, Tea City',
      phone: '(123) 456-7890',
      email: 'info@datemaple.com'
    },
    items: [
      { name: 'Home', title: '/', role: 'link' },
      { name: 'Menu', title: '/menu', role: 'link' },
      { name: 'Catering', title: '/events', role: 'link' },
      { name: 'About Us', title: '/about', role: 'link' },
      { name: 'Contact', title: '/contact', role: 'link' },
      { name: 'Monday-Friday', title: '7:00 AM - 8:00 PM', role: 'hours' },
      { name: 'Saturday', title: '8:00 AM - 9:00 PM', role: 'hours' },
      { name: 'Sunday', title: '8:00 AM - 6:00 PM', role: 'hours' }
    ]
  }
];

const seedHomePageContent = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dateandmaple');
    console.log('Connected to MongoDB');

    // Check existing content
    const existingContent = await HomePageContent.find();
    console.log(`Found ${existingContent.length} existing content sections`);

    // Create or update each section
    for (const content of defaultContent) {
      const existing = await HomePageContent.findOne({ section: content.section });
      
      if (existing) {
        console.log(`Section '${content.section}' already exists, skipping...`);
      } else {
        await HomePageContent.create(content);
        console.log(`Created section: ${content.section}`);
      }
    }

    console.log('\nSeeding completed successfully!');
    console.log('All homepage content sections are now editable through the admin panel.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding homepage content:', error);
    process.exit(1);
  }
};

// Run the seeder
seedHomePageContent();
