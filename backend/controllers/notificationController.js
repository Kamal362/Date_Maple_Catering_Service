const nodemailer = require('nodemailer');
const User = require('../models/User');
const Order = require('../models/Order');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your_smtp_user',
    pass: process.env.SMTP_PASS || 'your_smtp_password'
  }
});

// @desc    Send order confirmation email
// @route   POST /api/notifications/order-confirmation
// @access  Private (Admin only)
exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Get order details
    const order = await Order.findById(orderId).populate('user', 'firstName lastName email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || '"Date&Maple" <no-reply@datemaple.com>',
      to: order.user.email,
      subject: 'Order Confirmation - Date&Maple',
      html: `
        <h2>Order Confirmation</h2>
        <p>Dear ${order.user.firstName} ${order.user.lastName},</p>
        <p>Thank you for your order! Here are the details:</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p>We'll notify you when your order status changes.</p>
        <p>Best regards,<br>Date&Maple Team</p>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation email',
      error: error.message
    });
  }
};

// @desc    Send order status update email
// @route   POST /api/notifications/order-status
// @access  Private (Admin only)
exports.sendOrderStatusUpdate = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    // Get order details
    const order = await Order.findById(orderId).populate('user', 'firstName lastName email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || '"Date&Maple" <no-reply@datemaple.com>',
      to: order.user.email,
      subject: `Order Status Update - Date&Maple`,
      html: `
        <h2>Order Status Update</h2>
        <p>Dear ${order.user.firstName} ${order.user.lastName},</p>
        <p>Your order status has been updated:</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>New Status:</strong> ${order.status}</p>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Date&Maple Team</p>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent: %s', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'Order status update email sent successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send order status update email',
      error: error.message
    });
  }
};

// @desc    Send general notification email
// @route   POST /api/notifications/general
// @access  Private (Admin only)
exports.sendGeneralNotification = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    
    // Get user details
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Email content
    const mailOptions = {
      from: process.env.FROM_EMAIL || '"Date&Maple" <no-reply@datemaple.com>',
      to: user.email,
      subject: subject,
      html: `
        <h2>${subject}</h2>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>${message}</p>
        <p>Best regards,<br>Date&Maple Team</p>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('General notification email sent: %s', info.messageId);
    
    res.status(200).json({
      success: true,
      message: 'General notification email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send general notification email',
      error: error.message
    });
  }
};