const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

async function testSeparatedAuthSystem() {
  console.log('🚀 Testing Separated Authentication System...\n');

  try {
    // Test 1: Client Registration with unique email
    console.log('1️⃣ Testing Client Registration...');
    const clientData = {
      firstName: 'Jane',
      lastName: 'Customer',
      email: `jane.customer.${Date.now()}@test.com`,
      password: 'customer123',
      phone: '+1234567891'
    };

    const clientResponse = await axios.post(`${API_BASE_URL}/client/auth/register`, clientData);
    console.log('✅ Client registration successful');
    console.log('   Token:', clientResponse.data.token.substring(0, 20) + '...');
    console.log('   Role:', clientResponse.data.user.role);

    // Test 2: Guest Session Creation
    console.log('\n2️⃣ Testing Guest Session Creation...');
    const guestResponse = await axios.post(`${API_BASE_URL}/client/auth/guest-session`);
    console.log('✅ Guest session created successfully');
    console.log('   Guest ID:', guestResponse.data.guestId);
    console.log('   Cart ID:', guestResponse.data.cartId);

    // Test 3: Worker Login Setup
    console.log('\n3️⃣ Setting up Worker Account...');
    
    // Create worker admin account with unique email
    const workerEmail = `worker.manager.${Date.now()}@test.com`;
    try {
      const adminData = {
        firstName: 'Worker',
        lastName: 'Manager',
        email: workerEmail,
        password: 'worker123',
        phone: '+1987654322'
      };

      const adminResponse = await axios.post(`${API_BASE_URL}/auth/admin/create`, adminData);
      console.log('✅ Worker admin account created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Worker admin account already exists');
      } else {
        throw error;
      }
    }

    // Test 4: Worker Login
    console.log('\n4️⃣ Testing Worker Login...');
    const workerLoginData = {
      email: workerEmail,
      password: 'worker123'
    };

    const workerLoginResponse = await axios.post(`${API_BASE_URL}/worker/auth/login`, workerLoginData);
    console.log('✅ Worker login successful');
    console.log('   Token:', workerLoginResponse.data.token.substring(0, 20) + '...');
    console.log('   Role:', workerLoginResponse.data.user.role);

    // Test 5: Admin Login (using existing system)
    console.log('\n5️⃣ Testing Admin Login...');
    const adminLoginData = {
      email: 'admin@datemaple.com',
      password: 'admin123'
    };

    const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/passport/login`, adminLoginData);
    console.log('✅ Admin login successful');
    console.log('   Token:', adminLoginResponse.data.token.substring(0, 20) + '...');
    console.log('   Role:', adminLoginResponse.data.user.role);

    console.log('\n🎉 All Authentication Tests Passed!');
    console.log('\n📋 Available Endpoints:');
    console.log('🔐 CLIENT AUTHENTICATION:');
    console.log('   POST /api/client/auth/register     - Client registration');
    console.log('   POST /api/client/auth/login        - Client login');
    console.log('   POST /api/client/auth/guest-session - Guest checkout session');
    console.log('   POST /api/client/auth/convert-guest - Convert guest to user');
    console.log('   GET  /api/client/auth/profile      - Client profile (protected)');
    
    console.log('\n👷 WORKER AUTHENTICATION:');
    console.log('   POST /api/worker/auth/login        - Worker login');
    console.log('   POST /api/worker/auth/register     - Worker registration (admin only)');
    console.log('   GET  /api/worker/auth/profile      - Worker profile (protected)');
    
    console.log('\n👑 ADMIN AUTHENTICATION:');
    console.log('   POST /api/auth/admin/create        - Admin account creation');
    console.log('   POST /api/auth/passport/login      - Admin login');
    console.log('   POST /api/auth/passport/register   - User creation (admin only)');

    console.log('\n🎯 System Architecture:');
    console.log('   • Clients: Guest checkout + Registration option');
    console.log('   • Workers: Staff login with limited permissions');
    console.log('   • Admins: Full system access and user management');
    console.log('   • Clear role separation at API level');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testSeparatedAuthSystem();