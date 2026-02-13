const express = require('express');
const { getAllContent, getContentBySection, createOrUpdateContent, deleteContent } = require('../controllers/homePageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.route('/')
  .get(getAllContent);

router.route('/:section')
  .get(getContentBySection);

// Admin routes
router.route('/')
  .post(protect, authorize('admin'), createOrUpdateContent);

router.route('/:section')
  .delete(protect, authorize('admin'), deleteContent);

module.exports = router;