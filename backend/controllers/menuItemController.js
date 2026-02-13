const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get menu items by category
// @route   GET /api/menu/category/:category
// @access  Public
exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.find({ category });
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Admin only)
exports.createMenuItem = async (req, res) => {
  try {
    console.log('Creating menu item with data:', req.body);
    console.log('File data:', req.file);
    
    // Handle image upload
    let imageData = req.body.image; // Default to URL if provided
    
    if (req.file) {
      // If file was uploaded, use the uploaded file path
      imageData = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    // Parse JSON strings for arrays
    let dietary = req.body.dietary;
    let altMilkOptions = req.body.altMilkOptions;
    
    // If they're JSON strings, parse them
    if (typeof dietary === 'string') {
      try {
        dietary = JSON.parse(dietary);
      } catch (e) {
        dietary = [];
      }
    }
    
    if (typeof altMilkOptions === 'string') {
      try {
        altMilkOptions = JSON.parse(altMilkOptions);
      } catch (e) {
        altMilkOptions = [];
      }
    }
    
    // Convert string booleans to actual booleans
    const available = req.body.available === 'true' || req.body.available === true;
    const coldFoamAvailable = req.body.coldFoamAvailable === 'true' || req.body.coldFoamAvailable === true;
    
    // Convert price to number
    const price = parseFloat(req.body.price) || 0;
    
    // Merge file data with request body
    const menuItemData = {
      ...req.body,
      image: imageData,
      dietary: dietary || [],
      altMilkOptions: altMilkOptions || [],
      available: available,
      coldFoamAvailable: coldFoamAvailable,
      price: price
    };
    
    console.log('Final menu item data:', menuItemData);
    
    const menuItem = await MenuItem.create(menuItemData);
    
    console.log('Menu item created successfully:', menuItem._id);
    
    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin only)
exports.updateMenuItem = async (req, res) => {
  try {
    // Handle image upload
    let updateData = { ...req.body };
    
    if (req.file) {
      // If file was uploaded, use the uploaded file path
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin only)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};