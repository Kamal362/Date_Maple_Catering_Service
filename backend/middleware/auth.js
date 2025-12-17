const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  console.log('Auth middleware - Headers:', req.headers.authorization); // Debug log

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token); // Debug log

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded:', decoded); // Debug log

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found:', req.user); // Debug log

      if (!req.user) {
        console.log('User not found in database'); // Debug log
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error); // Debug log
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } else {
    console.log('No authorization header or invalid format'); // Debug log
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware - User role:', req.user?.role, 'Required roles:', roles); // Debug log
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
