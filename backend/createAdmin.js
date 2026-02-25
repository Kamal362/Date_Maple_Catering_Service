const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@datemaple.com',
      password: 'admin123',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists, updating role to admin...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin role updated successfully!');
    } else {
      const admin = await User.create(adminData);
      console.log('Admin created successfully!');
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
