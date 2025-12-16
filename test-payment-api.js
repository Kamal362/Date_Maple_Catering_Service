const axios = require('axios');

async function testPaymentAPI() {
  try {
    console.log('Testing payment methods API...');
    
    // Test getting payment methods
    const response = await axios.get('http://localhost:5000/api/payment-methods');
    console.log('Payment methods:', response.data);
  } catch (error) {
    console.error('Error testing payment API:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testPaymentAPI();