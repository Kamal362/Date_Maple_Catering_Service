const express = require('express');
const { getEvents, getMyEvents, getEvent, createEvent, updateEvent, updateEventStatus, deleteEvent, getPublicEvents } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public endpoint - get all confirmed events (no auth required)
router.get('/public', getPublicEvents);

router.route('/')
  .get(protect, authorize('admin'), getEvents)
  .post(protect, createEvent);

router.route('/myevents')
  .get(protect, getMyEvents);

router.route('/:id')
  .get(protect, getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateEventStatus);

module.exports = router;