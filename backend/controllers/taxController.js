const TaxSettings = require('../models/TaxSettings');

// @desc    Get current tax settings (public - needed by cart/checkout)
// @route   GET /api/tax
// @access  Public
const getTaxSettings = async (req, res) => {
  try {
    let settings = await TaxSettings.findOne();
    if (!settings) {
      // Return defaults if none exist in DB
      settings = { taxEnabled: true, taxRate: 8, taxLabel: 'Tax' };
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update tax settings (admin only)
// @route   PUT /api/tax
// @access  Private/Admin
const updateTaxSettings = async (req, res) => {
  try {
    const { taxEnabled, taxRate, taxLabel } = req.body;

    // Validate taxRate
    if (taxRate !== undefined) {
      const rate = Number(taxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ message: 'Tax rate must be between 0 and 100' });
      }
    }

    let settings = await TaxSettings.findOne();

    if (!settings) {
      // Create first record
      settings = new TaxSettings({
        taxEnabled: taxEnabled !== undefined ? taxEnabled : true,
        taxRate: taxRate !== undefined ? Number(taxRate) : 8,
        taxLabel: taxLabel || 'Tax',
        updatedBy: req.user._id
      });
    } else {
      if (taxEnabled !== undefined) settings.taxEnabled = taxEnabled;
      if (taxRate !== undefined) settings.taxRate = Number(taxRate);
      if (taxLabel !== undefined) settings.taxLabel = taxLabel;
      settings.updatedBy = req.user._id;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating tax settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTaxSettings, updateTaxSettings };
