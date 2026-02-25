const EventFlyer = require('../models/EventFlyer');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `event-flyer-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @desc    Upload event flyer
// @route   POST /api/events/flyers
// @access  Private (Admin only)
exports.uploadEventFlyer = [
  upload.single('flyer'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a flyer image'
        });
      }

      const { title, description, eventDate, location, priority } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Event title is required'
        });
      }

      // Create event flyer
      const eventFlyer = await EventFlyer.create({
        title,
        description: description || '',
        flyerImage: req.file.path, // Store the file path
        eventDate: eventDate ? new Date(eventDate) : undefined,
        location: location || '',
        priority: priority ? parseInt(priority) : 0
      });

      res.status(201).json({
        success: true,
        data: eventFlyer
      });
    } catch (error) {
      console.error('Upload event flyer error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

// @desc    Get all active event flyers
// @route   GET /api/events/flyers
// @access  Public
exports.getEventFlyers = async (req, res) => {
  try {
    const eventFlyers = await EventFlyer.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 }); // Sort by priority and then by date
    
    res.status(200).json({
      success: true,
      count: eventFlyers.length,
      data: eventFlyers
    });
  } catch (error) {
    console.error('Get event flyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single event flyer
// @route   GET /api/events/flyers/:id
// @access  Public
exports.getEventFlyer = async (req, res) => {
  try {
    const eventFlyer = await EventFlyer.findById(req.params.id);
    
    if (!eventFlyer) {
      return res.status(404).json({
        success: false,
        message: 'Event flyer not found'
      });
    }

    if (!eventFlyer.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event flyer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: eventFlyer
    });
  } catch (error) {
    console.error('Get event flyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update event flyer
// @route   PUT /api/events/flyers/:id
// @access  Private (Admin only)
exports.updateEventFlyer = [
  upload.single('flyer'),
  async (req, res) => {
    try {
      const { title, description, eventDate, location, priority, isActive } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (eventDate) updateData.eventDate = new Date(eventDate);
      if (location) updateData.location = location;
      if (priority) updateData.priority = parseInt(priority);
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

      // If a new flyer image was uploaded, update the path
      if (req.file) {
        updateData.flyerImage = req.file.path;
      }

      const eventFlyer = await EventFlyer.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true
        }
      );

      if (!eventFlyer) {
        return res.status(404).json({
          success: false,
          message: 'Event flyer not found'
        });
      }

      res.status(200).json({
        success: true,
        data: eventFlyer
      });
    } catch (error) {
      console.error('Update event flyer error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
];

// @desc    Delete event flyer
// @route   DELETE /api/events/flyers/:id
// @access  Private (Admin only)
exports.deleteEventFlyer = async (req, res) => {
  try {
    const eventFlyer = await EventFlyer.findByIdAndDelete(req.params.id);

    if (!eventFlyer) {
      return res.status(404).json({
        success: false,
        message: 'Event flyer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete event flyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};