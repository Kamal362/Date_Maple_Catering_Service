const Cart = require('../models/Cart');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Process checkout
// @route   POST /api/checkout
// @access  Private
exports.processCheckout = async (req, res) => {
  try {
    const { orderType, deliveryAddress, pickupTime, paymentMethod } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
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
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      pickupTime: orderType === 'pickup' ? pickupTime : undefined,
      paymentMethod,
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