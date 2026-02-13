const HomePageContent = require('../models/HomePageContent');

// @desc    Get all home page content
// @route   GET /api/home-content
// @access  Public
exports.getAllContent = async (req, res) => {
  try {
    const content = await HomePageContent.find();
    
    res.status(200).json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
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
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create or update home page content
// @route   POST /api/home-content
// @access  Private (Admin only)
exports.createOrUpdateContent = async (req, res) => {
  try {
    const { section } = req.body;
    
    // Check if content exists for this section
    let content = await HomePageContent.findOne({ section });
    
    if (content) {
      // Update existing content
      content = await HomePageContent.findOneAndUpdate(
        { section },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      // Create new content
      content = await HomePageContent.create(req.body);
    }
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
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
      message: 'Server error',
      error: error.message
    });
  }
};