const express = require('express');
const {
  getApprovedReviews,
  getMenuItemReviews,
  getMenuItemRating,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  updateReviewAdmin,
  deleteReviewAdmin
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/approved')
  .get(getApprovedReviews);

router.route('/item/:menuItemId')
  .get(getMenuItemReviews);

router.route('/item/:menuItemId/rating')
  .get(getMenuItemRating);

// Protected routes (user)
router.route('/my')
  .get(protect, getMyReviews);

router.route('/')
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Admin routes
router.route('/admin/all')
  .get(protect, authorize('admin'), getAllReviews);

router.route('/:id/approve')
  .put(protect, authorize('admin'), approveReview);

router.route('/admin/:id')
  .put(protect, authorize('admin'), updateReviewAdmin)
  .delete(protect, authorize('admin'), deleteReviewAdmin);

module.exports = router;