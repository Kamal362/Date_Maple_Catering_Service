const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateEmail, validatePassword, validateRequiredFields } = require('../middleware/validation');

const router = express.Router();

router.post('/register', 
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

module.exports = router;