const express = require('express');
const { processCheckout, processGuestCheckout, uploadReceipt } = require('../controllers/checkoutController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, uploadReceipt, processCheckout);

router.route('/guest')
  .post(optionalAuth, uploadReceipt, processGuestCheckout);

module.exports = router;