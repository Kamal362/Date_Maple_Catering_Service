const Cart = require('../models/Cart');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
}).single('paymentReceipt');

// Export upload middleware for use in routes
exports.uploadReceipt = upload;

// @desc    Process checkout
// @route   POST /api/checkout
// @access  Private
exports.processCheckout = async (req, res) => {
  try {
    console.log('Checkout request received');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('Files:', req.file);
    
    // Parse order data from form data
    let orderData;
    if (req.body.orderData) {
      orderData = JSON.parse(req.body.orderData);
      console.log('Parsed order data:', orderData);
    } else {
      orderData = req.body;
      console.log('Direct order data:', orderData);
    }
    
    const { orderType, deliveryAddress, pickupTime, paymentMethod } = orderData;
    
    // Get user's cart
    console.log('Looking up cart for user:', req.user.id);
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    console.log('Found cart:', cart);
    
    if (!cart) {
      console.log('Cart not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Cart not found. Please add items to your cart and try again.',
        debug: {
          userId: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (cart.items.length === 0) {
      console.log('Cart is empty for user:', req.user.id);
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items to your cart and try again.',
        debug: {
          userId: req.user.id,
          cartId: cart._id,
          itemCount: 0
        }
      });
    }
    
    // Calculate order total
    let totalAmount = cart.totalAmount;
    const taxRate = 0.08; // 8% tax
    const tax = totalAmount * taxRate;
    totalAmount += tax;
    
    // Create order items from cart items
    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      quantity: item.quantity,
      price: getItemPrice(item.menuItem, item),
      specialInstructions: item.specialInstructions
    }));
    
    // Handle payment receipt if uploaded
    let paymentReceiptUrl = null;
    if (req.file) {
      // In production, you might want to use a cloud storage service
      // For now, we'll store the relative path
      paymentReceiptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      pickupTime: orderType === 'pickup' ? pickupTime : undefined,
      paymentMethod,
      paymentReceipt: paymentReceiptUrl,
      tax
    });
    
    // Clear cart after successful order
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    
    // Populate order with menu item details
    await order.populate('items.menuItem');
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Process guest checkout
// @route   POST /api/checkout/guest
// @access  Public
exports.processGuestCheckout = async (req, res) => {
  try {
    console.log('Guest checkout request received');
    console.log('Request body:', req.body);
    console.log('Files:', req.file);
    
    // Parse order data from form data
    let orderData;
    if (req.body.orderData) {
      orderData = JSON.parse(req.body.orderData);
      console.log('Parsed order data:', orderData);
    } else {
      orderData = req.body;
      console.log('Direct order data:', orderData);
    }
    
    const { orderType, deliveryAddress, pickupTime, paymentMethod, guestInfo, items } = orderData;
    
    // Validate guest info
    if (!guestInfo || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Guest information is required. Please provide name, email, and phone.'
      });
    }
    
    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items to your cart and try again.'
      });
    }
    
    // Calculate order total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId || item.id);
      if (!menuItem) {
        console.log('Menu item not found:', item.menuItemId || item.id);
        continue;
      }
      
      const price = getItemPrice(menuItem, item);
      totalAmount += price * item.quantity;
      
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: price,
        specialInstructions: item.specialInstructions || ''
      });
    }
    
    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items in cart. Please try again.'
      });
    }
    
    const taxRate = 0.08; // 8% tax
    const tax = totalAmount * taxRate;
    totalAmount += tax;
    
    // Handle payment receipt if uploaded
    let paymentReceiptUrl = null;
    if (req.file) {
      paymentReceiptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Create order for guest
    const order = await Order.create({
      user: null, // No user for guest checkout
      guestInfo: {
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone
      },
      items: orderItems,
      totalAmount,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      pickupTime: orderType === 'pickup' ? pickupTime : undefined,
      paymentMethod,
      paymentReceipt: paymentReceiptUrl,
      tax,
      isGuestOrder: true
    });
    
    // Populate order with menu item details
    await order.populate('items.menuItem');
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Guest checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate item price
const getItemPrice = (menuItem, cartItem) => {
  let price = menuItem.price;
  
  // Check if a specific size is selected and has a different price
  if (cartItem.selectedSize && menuItem.sizes) {
    const sizeOption = menuItem.sizes.find(size => size.size === cartItem.selectedSize);
    if (sizeOption) {
      price = sizeOption.price;
    }
  }
  
  // Add cold foam cost if selected
  if (cartItem.addColdFoam) {
    price += 1.00; // Assuming $1 for cold foam
  }
  
  // Add alternative milk cost if selected
  if (cartItem.selectedMilk) {
    price += 0.75; // Assuming $0.75 for alternative milk
  }
  
  return price;
};