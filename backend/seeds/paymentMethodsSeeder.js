const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');
const connectDB = require('../config/db');

// Payment methods data
const paymentMethods = [
  {
    vendor: "Venmo",
    accountName: "Jamilah Abdullah",
    accountNumber: "",
    accountAlias: "@jmealz"
  },
  {
    vendor: "Cash App",
    accountName: "Jamilah Abdullah",
    accountNumber: "",
    accountAlias: "@jmealz"
  },
  {
    vendor: "Zelle",
    accountName: "Jamilah Abdullah",
    accountNumber: "342-434-0000",
    accountAlias: ""
  }
];

const seedPaymentMethods = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing payment methods
    await PaymentMethod.deleteMany({});
    console.log('Cleared existing payment methods');
    
    // Insert new payment methods
    await PaymentMethod.insertMany(paymentMethods);
    console.log('Payment methods seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding payment methods:', error);
    process.exit(1);
  }
};

seedPaymentMethods();