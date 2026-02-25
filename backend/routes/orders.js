const express = require('express');
const { getOrders, getMyOrders, getOrder, updateOrderStatus, updatePaymentStatus, deleteOrder, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrder)
  .delete(protect, authorize('admin'), deleteOrder);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatus);

router.route('/:id/payment')
  .put(protect, authorize('admin'), updatePaymentStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

module.exports = router;