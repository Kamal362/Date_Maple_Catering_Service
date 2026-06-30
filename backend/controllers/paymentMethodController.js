const PaymentMethod = require('../models/PaymentMethod');

// @desc    Get all payment methods
// @route   GET /api/payment-methods
// @access  Public
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ isActive: true });
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all payment methods (admin)
// @route   GET /api/payment-methods/admin
// @access  Private/Admin
const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({}).lean();
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a payment method
// @route   POST /api/payment-methods/admin
// @access  Private/Admin
const createPaymentMethod = async (req, res) => {
  try {
    const { 
      type, 
      vendor, 
      accountName, 
      accountNumber, 
      accountAlias,
      cardNumber,
      cardExpiry,
      cardCvv,
      description,
      instructions,
      isActive,
      displayOrder
    } = req.body;

    const paymentMethod = new PaymentMethod({
      type: type || 'digital_wallet',
      vendor,
      accountName,
      accountNumber: accountNumber || '',
      accountAlias: accountAlias || '',
      cardNumber: cardNumber || '',
      cardExpiry: cardExpiry || '',
      cardCvv: cardCvv || '',
      description: description || '',
      instructions: instructions || '',
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });

    const createdPaymentMethod = await paymentMethod.save();
    res.status(201).json(createdPaymentMethod);
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a payment method
// @route   PUT /api/payment-methods/admin/:id
// @access  Private/Admin
const updatePaymentMethod = async (req, res) => {
  try {
    const { 
      type,
      vendor, 
      accountName, 
      accountNumber, 
      accountAlias, 
      cardNumber,
      cardExpiry,
      cardCvv,
      description,
      instructions,
      isActive,
      displayOrder
    } = req.body;

    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Set default type for legacy records
    paymentMethod.type = type || paymentMethod.type || 'digital_wallet';
    if (vendor !== undefined) paymentMethod.vendor = vendor;
    if (accountName !== undefined) paymentMethod.accountName = accountName;
    if (accountNumber !== undefined) paymentMethod.accountNumber = accountNumber;
    if (accountAlias !== undefined) paymentMethod.accountAlias = accountAlias;
    if (cardNumber !== undefined) paymentMethod.cardNumber = cardNumber;
    if (cardExpiry !== undefined) paymentMethod.cardExpiry = cardExpiry;
    if (cardCvv !== undefined) paymentMethod.cardCvv = cardCvv;
    if (description !== undefined) paymentMethod.description = description;
    if (instructions !== undefined) paymentMethod.instructions = instructions;
    if (isActive !== undefined) paymentMethod.isActive = isActive;
    if (displayOrder !== undefined) paymentMethod.displayOrder = displayOrder;

    const updatedPaymentMethod = await paymentMethod.save();
    res.json(updatedPaymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a payment method
// @route   DELETE /api/admin/payment-methods/:id
// @access  Private/Admin
const deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await paymentMethod.deleteOne();
    res.json({ message: 'Payment method removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPaymentMethods,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
};