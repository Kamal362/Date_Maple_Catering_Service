const MenuItem = require('../models/MenuItem');
const { getUploadUrl } = require('../utils/uploadUrl');

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
      message: 'Server error'
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
      message: 'Server error'
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
      message: 'Server error'
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Admin only)
exports.createMenuItem = async (req, res) => {
  try {
    // Handle image upload
    let imageData = req.body.image; // Default to URL if provided

    if (req.file) {
      // If file was uploaded, store a relative path so it works in any environment
      imageData = getUploadUrl(req.file.filename);
    }

    // Defensive: image must be a string. If the frontend sent an object
    // (e.g. empty object or stale state), fall back to an empty string.
    if (imageData && typeof imageData !== 'string') {
      imageData = '';
    }

    // Parse JSON strings for arrays sent from FormData
    const parseJsonArray = (value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return value;
    };

    const dietary = parseJsonArray(req.body.dietary);
    const altMilkOptions = parseJsonArray(req.body.altMilkOptions);
    const sizes = parseJsonArray(req.body.sizes);
    const extras = parseJsonArray(req.body.extras);
    
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
      sizes: sizes || [],
      extras: extras || [],
      available: available,
      coldFoamAvailable: coldFoamAvailable,
      price: price
    };
    
    const menuItem = await MenuItem.create(menuItemData);
    
    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
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

    // Remove frontend id field so mongoose doesn't try to set it
    delete updateData.id;

    // Defensive: image must be a string or undefined. If the frontend sent an
    // object (e.g. empty object from stale state), clear it so the update works.
    if (updateData.image && typeof updateData.image !== 'string') {
      updateData.image = '';
    }

    if (req.file) {
      // If file was uploaded, store a relative path so it works in any environment
      updateData.image = getUploadUrl(req.file.filename);
    }

    // Parse JSON string arrays sent from FormData
    ['dietary', 'altMilkOptions', 'sizes', 'extras'].forEach((key) => {
      if (typeof updateData[key] === 'string') {
        try {
          updateData[key] = JSON.parse(updateData[key]);
        } catch (e) {
          updateData[key] = [];
        }
      }
    });

    // Convert string booleans/numbers to correct types
    if (typeof updateData.available === 'string') {
      updateData.available = updateData.available === 'true';
    }
    if (typeof updateData.coldFoamAvailable === 'string') {
      updateData.coldFoamAvailable = updateData.coldFoamAvailable === 'true';
    }
    if (typeof updateData.price === 'string') {
      updateData.price = parseFloat(updateData.price) || 0;
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
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
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
      message: 'Server error'
    });
  }
};