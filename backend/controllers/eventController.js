const Event = require('../models/Event');

// @desc    Get all events (Admin only)
// @route   GET /api/events
// @access  Private (Admin only)
exports.getEvents = async (req, res) => {
  try {
    console.log('Fetching all events for admin:', req.user?.email);
    const events = await Event.find().lean();
    console.log('Found events:', events.length);
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get events for logged in user
// @route   GET /api/events/myevents
// @access  Private
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ customer: req.user.id });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Make sure user is event owner or admin
    // Since customer is embedded object, we can't compare IDs directly
    // We'll check if the requesting user is an admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this event'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new event booking
// @route   POST /api/events
// @access  Public
exports.createEvent = async (req, res) => {
  try {
    // Validate required customer information
    const { fullName, email, phone } = req.body;
    
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required: fullName, email, and phone'
      });
    }
    
    // Create event with embedded customer data instead of reference
    const eventData = {
      ...req.body,
      customer: {
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || 'Customer',
        email: email,
        phone: phone
      }
    };
    
    // Remove the original customer fields
    delete eventData.fullName;
    
    const event = await Event.create(eventData);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Make sure user is admin (since customer is embedded object, we can't check ownership)
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private (Admin only)
exports.updateEventStatus = async (req, res) => {
  try {
    console.log('Update event status called:', req.params.id, req.body);
    const { status } = req.body;
    
    // Use findByIdAndUpdate to only update the status field without validating entire document
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { status: status } },
      { new: true, runValidators: false }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Make sure user is admin (since customer is embedded object, we can't check ownership)
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    await event.remove();
    
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

// @desc    Get public events (for client store - no auth required)
// @route   GET /api/events/public
// @access  Public
exports.getPublicEvents = async (req, res) => {
  try {
    // Get confirmed and completed events to display on the store
    const events = await Event.find({ 
      status: { $in: ['confirmed', 'completed'] }
    })
    .select('eventType eventDate location guestCount status createdAt customer')
    .sort({ eventDate: -1 })
    .lean();
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};