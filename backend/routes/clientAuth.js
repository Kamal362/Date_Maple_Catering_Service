const express = require('express');
const { 
  clientRegister, 
  clientLogin, 
  createGuestSession,
  convertGuestToUser,
  getClientProfile,
  updateClientProfile
} = require('../controllers/clientAuthController');
const { protect } = require('../middleware/auth');
const { validateEmail, validatePassword, validateRequiredFields } = require('../middleware/validation');

const router = express.Router();

// Client Registration
router.post('/register', 
  validateRequiredFields('firstName', 'lastName', 'email', 'password'),
  validateEmail,
  validatePassword,
  clientRegister
);

// Client Login
router.post('/login', 
  validateRequiredFields('email', 'password'),
  validateEmail,
  clientLogin
);

// Guest Checkout Session
router.post('/guest-session', createGuestSession);

// Convert Guest to Registered User
router.post('/convert-guest', 
  validateRequiredFields('firstName', 'lastName', 'email', 'password'),
  validateEmail,
  validatePassword,
  convertGuestToUser
);

// Protected Client Routes
router.get('/profile', protect, getClientProfile);
router.put('/profile', protect, updateClientProfile);

module.exports = router;