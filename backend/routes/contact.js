const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitInquiry,
  getAllInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry
} = require('../controllers/inquiryController');

// Public route - submit contact form
router.post('/', submitInquiry);

// Admin routes - manage inquiries
router.get('/', protect, authorize('admin'), getAllInquiries);
router.get('/:id', protect, authorize('admin'), getInquiry);
router.put('/:id', protect, authorize('admin'), updateInquiry);
router.delete('/:id', protect, authorize('admin'), deleteInquiry);

module.exports = router;
