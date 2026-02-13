const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/auth';

async function testPassportAuth() {
  console.log('🚀 Testing Passport Authentication System...\n');

  try {
    // Test 1: Create admin account
    console.log('1️⃣ Creating admin account...');
    const adminData = {
      firstName: 'Passport',
      lastName: 'Admin',
      email: 'passport.admin@datemaple.com',
      password: 'passport123',
      phone: '+1234567890'
    };

    console.log('Sending request to:', `${API_BASE_URL}/admin/create`);
    console.log('Request data:', JSON.stringify(adminData));

    const adminResponse = await axios.post(`${API_BASE_URL}/admin/create`, adminData);
    console.log('✅ Admin account created successfully');
    console.log('   Status:', adminResponse.status);
    console.log('   Token:', adminResponse.data.token ? adminResponse.data.token.substring(0, 20) + '...' : 'No token');
    console.log('   User:', adminResponse.data.user ? `${adminResponse.data.user.email} - ${adminResponse.data.user.role}` : 'No user data');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('   Message:', error.message);
    console.error('   Response:', error.response ? error.response.data : 'No response data');
    console.error('   Status:', error.response ? error.response.status : 'No status');
  }
}

// Run the tests
testPassportAuth();