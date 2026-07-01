const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URL_LIVE
        : process.env.MONGODB_URL_LOCAL;

    const conn = await mongoose.connect(
      mongoURI || 'mongodb://localhost:27017/date_maple'
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;