// Validation middleware for common inputs

// Validate email format
exports.validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  next();
};

// Validate phone number format
exports.validatePhone = (req, res, next) => {
  const { phone } = req.body;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number'
    });
  }
  
  next();
};

// Validate password strength
exports.validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password && password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  next();
};

// Validate required fields
exports.validateRequiredFields = (...fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Field '${field}' is required`
        });
      }
    }
    
    next();
  };
};

// Validate ObjectId format
exports.validateObjectId = (req, res, next) => {
  const { id } = req.params;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  if (id && !objectIdRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};