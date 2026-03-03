const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @desc    Get all approved reviews (for public testimonials)
// @route   GET /api/reviews/approved
// @access  Public
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('user', 'firstName lastName')
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

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
// @access  Public (both authenticated users and guests)
exports.createReview = async (req, res) => {
  try {
    const { menuItemId, orderId, rating, comment, guestEmail, guestName } = req.body;
    const Order = require('../models/Order');

    // Validate that either menuItem or order is provided
    if (!menuItemId && !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Either menuItemId or orderId must be provided'
      });
    }

    // Check if this is a guest review or authenticated user review
    const isGuestReview = !req.user;

    if (isGuestReview) {
      // Guest review - verify order exists and matches provided email
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required for guest reviews'
        });
      }

      if (!guestEmail || !guestName) {
        return res.status(400).json({
          success: false,
          message: 'Guest email and name are required'
        });
      }

      const order = await Order.findById(orderId);
      if (!order || !order.isGuestOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or not a guest order'
        });
      }

      // Verify guest email matches order's guestInfo
      if (order.guestInfo?.email?.toLowerCase() !== guestEmail.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Email does not match the order'
        });
      }

      // Check if guest has already reviewed this order
      const existingReview = await Review.findOne({
        isGuestReview: true,
        guestEmail: guestEmail.toLowerCase(),
        order: orderId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this order'
        });
      }

      // Create guest review
      const review = await Review.create({
        isGuestReview: true,
        guestEmail: guestEmail.toLowerCase(),
        guestName: guestName,
        order: orderId,
        rating,
        comment,
        isApproved: false
      });

      return res.status(201).json({
        success: true,
        data: review,
        message: 'Review submitted successfully. It will be visible after approval.'
      });
    }

    // Authenticated user review
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
      if (!order || order.user?.toString() !== req.user.id) {
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
      isApproved: false
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

// @desc    Update a review (rating/comment/approval) - Admin only
// @route   PUT /api/reviews/admin/:id
// @access  Private/Admin
exports.updateReviewAdmin = async (req, res) => {
  try {
    const { rating, comment, isApproved } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (isApproved !== undefined) review.isApproved = isApproved;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'firstName lastName email')
      .populate('menuItem', 'name')
      .populate('order', 'orderId');

    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
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
