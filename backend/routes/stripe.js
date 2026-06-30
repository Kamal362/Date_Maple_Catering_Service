const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getStripeConfig,
  createPaymentIntent,
  confirmPayment,
  getPaymentIntent,
  createCustomer,
  savePaymentMethod,
  getCustomerPaymentMethods,
  processRefund,
  getPaymentMethod,
} = require('../controllers/stripeController');

// Public routes
router.get('/config', getStripeConfig);

// Routes accessible by both authenticated users and guests (guest checkout)
router.post('/create-payment-intent', optionalAuth, createPaymentIntent);
router.post('/confirm-payment', optionalAuth, confirmPayment);

// Private routes (require authentication)
router.get('/payment-intent/:id', protect, getPaymentIntent);
router.post('/create-customer', protect, createCustomer);
router.post('/save-payment-method', protect, savePaymentMethod);
router.get('/customer/:customerId/payment-methods', protect, getCustomerPaymentMethods);
router.get('/payment-method/:id', protect, getPaymentMethod);

// Admin-only routes
router.post('/refund', protect, authorize('admin'), processRefund);

// Note: The webhook route (POST /api/stripe/webhook) is mounted separately
// in server.js BEFORE express.json() because Stripe signature verification
// requires the raw request body as a Buffer.

module.exports = router;
