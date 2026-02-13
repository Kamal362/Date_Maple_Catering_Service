const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Client Registration (simplified)
exports.clientRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create customer user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'customer'
    });

    // Generate token
    const token = generateToken(user._id);

    // Create empty cart for new user
    await Cart.create({
      user: user._id,
      items: [],
      totalAmount: 0
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Client registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Client Login
exports.clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify customer role
    if (user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Please use appropriate login portal.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Guest Checkout Session Creation
exports.createGuestSession = async (req, res) => {
  try {
    // Create temporary guest identifier
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate temporary token for guest session
    const token = jwt.sign(
      { id: guestId, isGuest: true }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '2h' }
    );

    // Create temporary cart for guest
    const cart = await Cart.create({
      user: null, // No user association for guests
      guestId: guestId,
      items: [],
      totalAmount: 0
    });

    res.status(201).json({
      success: true,
      token,
      guestId,
      cartId: cart._id,
      message: 'Guest session created successfully'
    });
  } catch (error) {
    console.error('Guest session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create guest session',
      error: error.message
    });
  }
};

// Convert Guest to Registered User
exports.convertGuestToUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, guestId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'customer'
    });

    // Transfer guest cart to user if exists
    if (guestId) {
      await Cart.updateOne(
        { guestId: guestId },
        { 
          user: user._id,
          guestId: null 
        }
      );
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Guest conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message
    });
  }
};

// Get Client Profile
exports.getClientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Client Profile
exports.updateClientProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Build update object
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};