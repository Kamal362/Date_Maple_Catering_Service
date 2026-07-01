const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use Atlas live URL in all environments; local MongoDB is no longer used
    const mongoURI = process.env.MONGODB_URL_LIVE;

    if (!mongoURI) {
      console.error('Error: MONGODB_URL_LIVE is not defined in .env');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;