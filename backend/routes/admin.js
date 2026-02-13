const express = require('express');
const { getDashboardStats, getUsers, getUser, updateUser, deleteUser, getLowInventory, createUser } = require('../controllers/adminController');
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

module.exports = router;