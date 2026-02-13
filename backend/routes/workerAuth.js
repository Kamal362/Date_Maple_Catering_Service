const express = require('express');
const { 
  workerLogin, 
  getWorkerProfile,
  workerRegister
} = require('../controllers/workerAuthController');
const { protect, authorize } = require('../middleware/auth');
const { validateEmail, validatePassword, validateRequiredFields } = require('../middleware/validation');

const router = express.Router();

// Worker Login
router.post('/login', 
  validateRequiredFields('email', 'password'),
  validateEmail,
  workerLogin
);

// Worker Registration (Admin only)
router.post('/register', 
  protect,
  authorize('admin'),
  validateRequiredFields('firstName', 'lastName', 'email', 'password'),
  validateEmail,
  validatePassword,
  workerRegister
);

// Protected Worker Routes
router.get('/profile', protect, authorize('worker', 'admin'), getWorkerProfile);

module.exports = router;