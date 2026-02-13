const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem');
    
    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addItemToCart = async (req, res) => {
  try {
    console.log('addItemToCart called with body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { menuItemId, quantity, specialInstructions, selectedSize, selectedMilk, addColdFoam } = req.body;
    
    // Check if menu item exists
    console.log('Looking for menu item with ID:', menuItemId);
    const menuItem = await MenuItem.findById(menuItemId);
    console.log('Found menu item:', menuItem);
    
    if (!menuItem) {
      console.log('Menu item not found for ID:', menuItemId);
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Find or create cart
    console.log('Looking for existing cart for user:', req.user.id);
    let cart = await Cart.findOne({ user: req.user.id });
    console.log('Existing cart found:', cart);
    
    if (!cart) {
      console.log('Creating new cart for user:', req.user.id);
      cart = await Cart.create({ user: req.user.id, items: [] });
      console.log('New cart created:', cart);
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.menuItem.toString() === menuItemId &&
      item.selectedSize === selectedSize &&
      item.selectedMilk === selectedMilk &&
      item.addColdFoam === addColdFoam
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        menuItem: menuItemId,
        quantity,
        specialInstructions,
        selectedSize,
        selectedMilk,
        addColdFoam
      });
    }
    
    // Calculate total amount
    cart.totalAmount = await calculateCartTotal(cart);
    
    await cart.save();
    
    // Populate menu item details
    await cart.populate('items.menuItem');
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error in addItemToCart:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    
    // Calculate total amount
    cart.totalAmount = await calculateCartTotal(cart);
    
    await cart.save();
    
    // Populate menu item details
    await cart.populate('items.menuItem');
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    // Calculate total amount
    cart.totalAmount = await calculateCartTotal(cart);
    
    await cart.save();
    
    // Populate menu item details
    await cart.populate('items.menuItem');
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    cart.totalAmount = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate cart total
const calculateCartTotal = async (cart) => {
  let total = 0;
  
  for (const item of cart.items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (menuItem) {
      let itemPrice = menuItem.price;
      
      // Check if a specific size is selected and has a different price
      if (item.selectedSize && menuItem.sizes) {
        const sizeOption = menuItem.sizes.find(size => size.size === item.selectedSize);
        if (sizeOption) {
          itemPrice = sizeOption.price;
        }
      }
      
      // Add cold foam cost if selected
      if (item.addColdFoam) {
        itemPrice += 1.00; // Assuming $1 for cold foam
      }
      
      // Add alternative milk cost if selected
      if (item.selectedMilk) {
        itemPrice += 0.75; // Assuming $0.75 for alternative milk
      }
      
      total += itemPrice * item.quantity;
    }
  }
  
  return total;
};