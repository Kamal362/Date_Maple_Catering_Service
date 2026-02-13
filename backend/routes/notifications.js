const express = require('express');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendGeneralNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/order-confirmation')
  .post(protect, authorize('admin'), sendOrderConfirmation);

router.route('/order-status')
  .post(protect, authorize('admin'), sendOrderStatusUpdate);

router.route('/general')
  .post(protect, authorize('admin'), sendGeneralNotification);

module.exports = router;