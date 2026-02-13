const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @desc    Get all approved reviews for a menu item
// @route   GET /api/reviews/item/:menuItemId
// @access  Public
exports.getMenuItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      menuItem: req.params.menuItemId,
      isApproved: true
    })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching menu item reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

// @desc    Get average rating for a menu item
// @route   GET /api/reviews/item/:menuItemId/rating
// @access  Public
exports.getMenuItemRating = async (req, res) => {
  try {
    const reviews = await Review.find({
      menuItem: req.params.menuItemId,
      isApproved: true
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      }
    });
  } catch (error) {
    console.error('Error fetching menu item rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rating'
    });
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('menuItem', 'name image')
      .populate('order', 'orderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching my reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reviews'
    });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { menuItemId, orderId, rating, comment } = req.body;

    // Validate that either menuItem or order is provided
    if (!menuItemId && !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Either menuItemId or orderId must be provided'
      });
    }

    // Check if user has already reviewed this item/order
    const existingReview = await Review.findOne({
      user: req.user.id,
      ...(menuItemId && { menuItem: menuItemId }),
      ...(orderId && { order: orderId })
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // If reviewing an order, verify user owns the order
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only review your own orders'
        });
      }
    }

    const review = await Review.create({
      user: req.user.id,
      ...(menuItemId && { menuItem: menuItemId }),
      ...(orderId && { order: orderId }),
      rating,
      comment,
      isApproved: false // Requires admin approval
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'firstName lastName')
      .populate('menuItem', 'name')
      .populate('order', 'orderId');

    res.status(201).json({
      success: true,
      data: populatedReview,
      message: 'Review submitted successfully. It will be visible after approval.'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review'
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    review.isApproved = false; // Reset approval status on edit

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'firstName lastName')
      .populate('menuItem', 'name')
      .populate('order', 'orderId');

    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
};

// @desc    Get all reviews (including unapproved) - Admin only
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'firstName lastName email')
      .populate('menuItem', 'name')
      .populate('order', 'orderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

// @desc    Approve a review - Admin only
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isApproved = true;
    await review.save();

    const approvedReview = await Review.findById(review._id)
      .populate('user', 'firstName lastName')
      .populate('menuItem', 'name')
      .populate('order', 'orderId');

    res.json({
      success: true,
      data: approvedReview,
      message: 'Review approved successfully'
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving review'
    });
  }
};

// @desc    Delete a review - Admin only
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
exports.deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
};
