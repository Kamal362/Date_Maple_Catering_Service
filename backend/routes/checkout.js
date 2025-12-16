const express = require('express');
const { processCheckout } = require('../controllers/checkoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, processCheckout);

module.exports = router;