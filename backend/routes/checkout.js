const express = require('express');
const { processCheckout, uploadReceipt } = require('../controllers/checkoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, uploadReceipt, processCheckout);

module.exports = router;