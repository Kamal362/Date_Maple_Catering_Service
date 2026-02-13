const express = require('express');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
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

module.exports = router;