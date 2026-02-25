const express = require('express');
const { register, login, getMe, updateProfile, changePassword, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateEmail, validatePassword, validateRequiredFields } = require('../middleware/validation');

const router = express.Router();

router.post('/register', 
  protect,
  validateRequiredFields('firstName', 'lastName', 'email', 'password'),
  validateEmail,
  validatePassword,
  register
);

router.post('/login', 
  validateRequiredFields('email', 'password'),
  validateEmail,
  login
);
router.get('/me', protect, getMe);

// Profile update routes
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Forgot password route (public - no authentication required)
router.post('/forgot-password', 
  validateRequiredFields('email', 'newPassword', 'secretKey'),
  validateEmail,
  validatePassword,
  forgotPassword
);

module.exports = router;