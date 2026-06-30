const HomePageContent = require('../models/HomePageContent');

// @desc    Get all home page content
// @route   GET /api/home-content
// @access  Public
exports.getAllContent = async (req, res) => {
  try {
    const content = await HomePageContent.find();
    
    // Set cache-control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.status(200).json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get home page content by section
// @route   GET /api/home-content/:section
// @access  Public
exports.getContentBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const content = await HomePageContent.findOne({ section });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Set cache-control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create or update home page content
// @route   POST /api/home-content
// @access  Private (Admin only)
exports.createOrUpdateContent = async (req, res) => {
  try {
    const { section } = req.body;
    
    if (!section) {
      return res.status(400).json({
        success: false,
        message: 'Section is required'
      });
    }
    
    // Strip read-only fields that should not be overwritten
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Check if content exists for this section
    let content = await HomePageContent.findOne({ section });
    
    if (content) {
      // Update existing content
      content = await HomePageContent.findOneAndUpdate(
        { section },
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new content
      content = await HomePageContent.create(updateData);
    }
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error saving homepage content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete home page content
// @route   DELETE /api/home-content/:section
// @access  Private (Admin only)
exports.deleteContent = async (req, res) => {
  try {
    const { section } = req.params;
    const content = await HomePageContent.findOneAndDelete({ section });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
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