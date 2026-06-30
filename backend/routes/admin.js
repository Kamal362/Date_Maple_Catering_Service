const express = require('express');
const { getDashboardStats, getUsers, getUser, updateUser, deleteUser, getLowInventory, createUser, getRevenueTrend, getPopularItems, getSalesByCategory, getPeakHours, getCustomerDemographics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/stats')
  .get(protect, authorize('admin'), getDashboardStats);

router.route('/users')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/users/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/inventory/low')
  .get(protect, authorize('admin'), getLowInventory);

// Analytics routes
router.route('/analytics/revenue-trend')
  .get(protect, authorize('admin'), getRevenueTrend);

router.route('/analytics/popular-items')
  .get(protect, authorize('admin'), getPopularItems);

router.route('/analytics/sales-by-category')
  .get(protect, authorize('admin'), getSalesByCategory);

router.route('/analytics/peak-hours')
  .get(protect, authorize('admin'), getPeakHours);

router.route('/analytics/demographics')
  .get(protect, authorize('admin'), getCustomerDemographics);

module.exports = router;