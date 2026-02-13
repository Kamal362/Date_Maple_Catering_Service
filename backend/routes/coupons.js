const express = require('express');
const {
  createCoupon,
  getCoupons,
  getActiveCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/active')
  .get(getActiveCoupons);

router.route('/validate')
  .post(validateCoupon);

// Protected routes (user)
router.route('/:id/apply')
  .post(protect, applyCoupon);

// Admin routes
router.route('/')
  .post(protect, authorize('admin'), createCoupon)
  .get(protect, authorize('admin'), getCoupons);

router.route('/:id')
  .get(protect, authorize('admin'), getCoupon)
  .put(protect, authorize('admin'), updateCoupon)
  .delete(protect, authorize('admin'), deleteCoupon);

module.exports = router;