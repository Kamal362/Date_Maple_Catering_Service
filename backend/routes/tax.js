const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getTaxSettings, updateTaxSettings } = require('../controllers/taxController');

// Public - cart & checkout need to fetch tax rate
router.get('/', getTaxSettings);

// Admin only - modify tax settings
router.put('/', protect, authorize('admin'), updateTaxSettings);

module.exports = router;
