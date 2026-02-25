const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/date_maple');
    console.log('Connected to MongoDB');

    const admins = await User.find({ role: 'admin' }).select('firstName lastName email role');
    
    console.log('\n=== Admin Users ===');
    if (admins.length === 0) {
      console.log('No admin users found!');
    } else {
      admins.forEach(admin => {
        console.log(`- ${admin.firstName} ${admin.lastName} (${admin.email}) - Role: ${admin.role}`);
      });
    }
    
    console.log('\n=== All Users ===');
    const allUsers = await User.find().select('firstName lastName email role');
    allUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verifyAdmin();
