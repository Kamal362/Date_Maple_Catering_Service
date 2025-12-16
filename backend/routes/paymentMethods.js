const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPaymentMethods,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} = require('../controllers/paymentMethodController');

// Public routes
router.get('/', getPaymentMethods);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllPaymentMethods);
router.post('/admin', protect, authorize('admin'), createPaymentMethod);
router.put('/admin/:id', protect, authorize('admin'), updatePaymentMethod);
router.delete('/admin/:id', protect, authorize('admin'), deletePaymentMethod);

module.exports = router;