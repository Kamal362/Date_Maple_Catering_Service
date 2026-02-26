const Order = require('../models/Order');

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private (Admin only)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'firstName lastName email').populate('items.menuItem');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get orders for logged in user
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.menuItem');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email').populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Make sure user is order owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
};

// @desc    Track order (Public - for guests and logged-in users)
// @route   GET /api/orders/track/:id
// @access  Public
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // If user is logged in, verify they own the order (unless admin)
    if (req.user) {
      const isOwner = order.user && order.user.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to view this order'
        });
      }
    }
    // For guests, they can only view guest orders
    else if (!order.isGuestOrder) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view this order'
      });
    }
    
    // Return order with limited info for privacy
    const orderData = {
      _id: order._id,
      orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
      status: order.status,
      orderType: order.orderType,
      totalAmount: order.totalAmount,
      tax: order.tax,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deliveryAddress: order.deliveryAddress,
      pickupTime: order.pickupTime,
      isGuestOrder: order.isGuestOrder,
      // Only show guest info if it's a guest order
      guestInfo: order.isGuestOrder ? order.guestInfo : undefined
    };
    
    res.status(200).json({
      success: true,
      data: orderData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update status
    order.status = status;
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentReceipt } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update payment status
    order.paymentStatus = paymentStatus;
    if (paymentReceipt) {
      order.paymentReceipt = paymentReceipt;
    }
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    console.log('Attempting to delete order with ID:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      console.log('Order not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('Found order, proceeding with deletion');
    await Order.deleteOne({ _id: req.params.id });
    console.log('Order deleted successfully');
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Make sure user is order owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Only allow cancellation if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is already in progress'
      });
    }
    
    // Update status to cancelled
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
