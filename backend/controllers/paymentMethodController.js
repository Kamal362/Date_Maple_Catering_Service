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
    console.log('Fetching all payment methods for admin:', req.user?.email);
    const paymentMethods = await PaymentMethod.find({}).lean();
    console.log('Found payment methods:', paymentMethods.length);
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a payment method
// @route   POST /api/admin/payment-methods
// @access  Private/Admin
const createPaymentMethod = async (req, res) => {
  try {
    const { vendor, accountName, accountNumber, accountAlias } = req.body;

    const paymentMethod = new PaymentMethod({
      vendor,
      accountName,
      accountNumber: accountNumber || '',
      accountAlias: accountAlias || ''
    });

    const createdPaymentMethod = await paymentMethod.save();
    res.status(201).json(createdPaymentMethod);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a payment method
// @route   PUT /api/admin/payment-methods/:id
// @access  Private/Admin
const updatePaymentMethod = async (req, res) => {
  try {
    const { vendor, accountName, accountNumber, accountAlias, isActive } = req.body;

    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    paymentMethod.vendor = vendor || paymentMethod.vendor;
    paymentMethod.accountName = accountName || paymentMethod.accountName;
    paymentMethod.accountNumber = accountNumber !== undefined ? accountNumber : paymentMethod.accountNumber;
    paymentMethod.accountAlias = accountAlias !== undefined ? accountAlias : paymentMethod.accountAlias;
    paymentMethod.isActive = isActive !== undefined ? isActive : paymentMethod.isActive;

    const updatedPaymentMethod = await paymentMethod.save();
    res.json(updatedPaymentMethod);
  } catch (error) {
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