const express = require('express');
const { getMenuItems, getMenuItemsByCategory, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuItemController');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, authorize('admin'), createMenuItem);

router.route('/category/:category')
  .get(getMenuItemsByCategory);

router.route('/:id')
  .get(validateObjectId, getMenuItem)
  .put(protect, authorize('admin'), validateObjectId, updateMenuItem)
  .delete(protect, authorize('admin'), validateObjectId, deleteMenuItem);

module.exports = router;