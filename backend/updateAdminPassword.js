const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const updateAdminPassword = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Find the admin user
    const user = await User.findOne({ email: 'admin@datemaple.com' });
    if (!user) {
      console.log('Admin user not found');
      process.exit(1);
    }
    
    console.log('Found user:', user.email);
    console.log('Current password (before update):', user.password);
    
    // Set the plain text password - the pre-save middleware will hash it
    user.password = 'admin123';
    await user.save();
    
    console.log('Admin password updated successfully');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('New password (after update):', user.password);
    
    // Verify the password
    const isMatch = await user.comparePassword('admin123');
    console.log('Password verification result:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();