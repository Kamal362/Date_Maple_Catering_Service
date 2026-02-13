const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api/auth';

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

    const adminResponse = await axios.post(`${API_BASE_URL}/admin/create`, adminData);
    console.log('✅ Admin account created successfully');
    console.log('   Token:', adminResponse.data.token.substring(0, 20) + '...');
    console.log('   User:', adminResponse.data.user.email, '-', adminResponse.data.user.role);

    // Test 2: Login with Passport
    console.log('\n2️⃣ Testing Passport login...');
    const loginData = {
      email: 'passport.admin@datemaple.com',
      password: 'passport123'
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/passport/login`, loginData);
    console.log('✅ Passport login successful');
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
    console.log('   User:', loginResponse.data.user.email, '-', loginResponse.data.user.role);

    const passportToken = loginResponse.data.token;

    // Test 3: Get current user with Passport authentication
    console.log('\n3️⃣ Testing current user retrieval...');
    const currentUserResponse = await axios.get(`${API_BASE_URL}/passport/me`, {
      headers: {
        'Authorization': `Bearer ${passportToken}`
      }
    });
    console.log('✅ Current user retrieved successfully');
    console.log('   User:', currentUserResponse.data.user.email, '-', currentUserResponse.data.user.role);

    // Test 4: Admin creates another user using Passport registration
    console.log('\n4️⃣ Testing admin user creation via Passport...');
    const newUser = {
      firstName: 'Passport',
      lastName: 'User',
      email: 'passport.user@datemaple.com',
      password: 'user123',
      phone: '+1987654321',
      role: 'customer'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/passport/register`, newUser, {
      headers: {
        'Authorization': `Bearer ${passportToken}`
      }
    });
    console.log('✅ User created successfully via Passport');
    console.log('   New User:', registerResponse.data.user.email, '-', registerResponse.data.user.role);

    console.log('\n🎉 All Passport authentication tests passed!');
    console.log('\n📋 Available Passport Endpoints:');
    console.log('   POST /api/auth/admin/create     - Create admin account (no auth required)');
    console.log('   POST /api/auth/passport/login   - Login with Passport authentication');
    console.log('   POST /api/auth/passport/register - Admin creates users (requires auth)');
    console.log('   GET  /api/auth/passport/me      - Get current user (requires auth)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testPassportAuth();