const express = require('express');
const { 
  passportLogin, 
  passportRegister, 
  passportProtect, 
  createAdminAccount,
  getCurrentUser 
} = require('../controllers/passportAuthController');
const { validateEmail, validatePassword, validateRequiredFields } = require('../middleware/validation');

const router = express.Router();

// Admin account creation (no authentication required)
router.post('/admin/create', 
  validateRequiredFields('firstName', 'lastName', 'email', 'password'),
  validateEmail,
  validatePassword,
  createAdminAccount
);

// Passport-based login
router.post('/passport/login', 
  validateRequiredFields('email', 'password'),
  validateEmail,
  passportLogin
);

// Passport-based registration (admin only)
router.post('/passport/register', 
  passportProtect,
  validateRequiredFields('firstName', 'lastName', 'email', 'password'),
  validateEmail,
  validatePassword,
  passportRegister
);

// Get current user with Passport authentication
router.get('/passport/me', passportProtect, getCurrentUser);

module.exports = router;