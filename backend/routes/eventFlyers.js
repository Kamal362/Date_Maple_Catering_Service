const express = require('express');
const { 
  uploadEventFlyer, 
  getEventFlyers, 
  getEventFlyer, 
  updateEventFlyer, 
  deleteEventFlyer 
} = require('../controllers/eventFlyerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes will be prefixed with /api/events/flyers

// Public routes (no authentication required)
router.get('/', getEventFlyers);
router.get('/:id', getEventFlyer);

// Private routes (admin authentication required)
router.post('/', protect, authorize('admin'), uploadEventFlyer);
router.put('/:id', protect, authorize('admin'), updateEventFlyer);
router.delete('/:id', protect, authorize('admin'), deleteEventFlyer);

module.exports = router;