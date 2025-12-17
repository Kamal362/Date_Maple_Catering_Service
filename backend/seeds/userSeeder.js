const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Admin user data
const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@datemaple.com",
  password: "admin123",
  role: "admin",
  phone: "123-456-7890"
};

const seedAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminUser.email });
    if (existingUser) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Hash password before creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    // Create admin user with hashed password
    await User.create({
      ...adminUser,
      password: hashedPassword
    });
    
    console.log('Admin user created successfully with hashed password');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdminUser();