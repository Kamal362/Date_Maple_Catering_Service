const User = require('../models/User');
const Order = require('../models/Order');
const Event = require('../models/Event');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for various entities
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const eventCount = await Event.countDocuments();
    const menuItemCount = await MenuItem.countDocuments();
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .populate('items.menuItem', 'name');
      
    // Get recent events (customer is embedded, no populate needed)
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5);
      
    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get event status distribution
    const eventStatusDistribution = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get revenue trend (monthly for last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format monthly revenue data
    const monthlyRevenue = revenueTrend.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-01`,
      amount: item.amount,
      orderCount: item.orderCount
    }));
    
    // Get sales by category
    const salesByCategory = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem',
          foreignField: '_id',
          as: 'menuItemData'
        }
      },
      { $unwind: '$menuItemData' },
      {
        $group: {
          _id: '$menuItemData.category',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: userCount,
          orders: orderCount,
          events: eventCount,
          menuItems: menuItemCount
        },
        recentOrders,
        recentEvents,
        orderStatusDistribution,
        eventStatusDistribution,
        revenueTrend: monthlyRevenue,
        salesByCategory: salesByCategory.map(item => ({ category: item._id || 'Other', sales: item.sales, revenue: item.revenue }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role = 'customer' } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }

    // Build update object with only provided fields to avoid overwriting with undefined
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (role !== undefined) updateFields.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get low inventory items
// @route   GET /api/admin/inventory/low
// @access  Private (Admin only)
exports.getLowInventory = async (req, res) => {
  try {
    // Use $expr to compare two fields within the same document
    const lowInventoryItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      count: lowInventoryItems.length,
      data: lowInventoryItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get revenue trend
// @route   GET /api/admin/analytics/revenue-trend
// @access  Private (Admin only)
exports.getRevenueTrend = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy, sortBy;

    if (period === 'daily') {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
      sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
    } else if (period === 'weekly') {
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
      sortBy = { '_id.year': 1, '_id.week': 1 };
    } else {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      sortBy = { '_id.year': 1, '_id.month': 1 };
    }

    const revenueTrend = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: groupBy, amount: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $sort: sortBy }
    ]);

    const formatted = revenueTrend.map(item => ({
      date: item._id.day
        ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
        : `${item._id.year}-${String(item._id.month || 1).padStart(2, '0')}-01`,
      amount: item.amount,
      orderCount: item.orderCount
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get popular menu items
// @route   GET /api/admin/analytics/popular-items
// @access  Private (Admin only)
exports.getPopularItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'menuItemData' } },
      { $unwind: '$menuItemData' },
      { $group: { _id: '$menuItemData.name', salesCount: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { salesCount: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: '$_id', salesCount: 1, revenue: 1 } }
    ]);

    res.status(200).json({ success: true, data: popularItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get sales by category
// @route   GET /api/admin/analytics/sales-by-category
// @access  Private (Admin only)
exports.getSalesByCategory = async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'menuItemData' } },
      { $unwind: '$menuItemData' },
      { $group: { _id: '$menuItemData.category', sales: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $project: { _id: 0, category: { $ifNull: ['$_id', 'Other'] }, sales: 1, revenue: 1 } }
    ]);

    res.status(200).json({ success: true, data: salesByCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get peak hours
// @route   GET /api/admin/analytics/peak-hours
// @access  Private (Admin only)
exports.getPeakHours = async (req, res) => {
  try {
    const peakHours = await Order.aggregate([
      { $group: { _id: { $hour: '$createdAt' }, orderCount: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
      { $project: { _id: 0, hour: '$_id', orderCount: 1 } }
    ]);

    res.status(200).json({ success: true, data: peakHours });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get customer demographics
// @route   GET /api/admin/analytics/demographics
// @access  Private (Admin only)
exports.getCustomerDemographics = async (req, res) => {
  try {
    const ageGroups = await User.aggregate([
      { $match: { age: { $exists: true, $ne: null } } },
      { $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 26, 36, 46, 56, 200],
          default: 'Unknown',
          output: { count: { $sum: 1 } }
      } },
      { $project: { _id: 0, range: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ['$_id', 0] }, { $lt: ['$_id', 18] }] }, then: 'Under 18' },
              { case: { $and: [{ $gte: ['$_id', 18] }, { $lt: ['$_id', 26] }] }, then: '18-25' },
              { case: { $and: [{ $gte: ['$_id', 26] }, { $lt: ['$_id', 36] }] }, then: '26-35' },
              { case: { $and: [{ $gte: ['$_id', 36] }, { $lt: ['$_id', 46] }] }, then: '36-45' },
              { case: { $and: [{ $gte: ['$_id', 46] }, { $lt: ['$_id', 56] }] }, then: '46-55' },
              { case: { $gte: ['$_id', 56] }, then: '55+' }
            ],
            default: 'Unknown'
          }
      }, count: 1 } }
    ]);

    const genderDistribution = await User.aggregate([
      { $match: { gender: { $exists: true, $ne: null } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { _id: 0, gender: '$_id', count: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { ageGroups, genderDistribution }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
