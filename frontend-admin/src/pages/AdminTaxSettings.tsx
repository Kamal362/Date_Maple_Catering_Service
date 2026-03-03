import React, { useState, useEffect } from 'react';
import { getTaxSettings, updateTaxSettings, TaxSettings } from '../services/taxService';
import { useToast } from '../context/ToastContext';

const AdminTaxSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TaxSettings>({
    taxEnabled: true,
    taxRate: 8,
    taxLabel: 'Tax',
  });
  const [rateInput, setRateInput] = useState('8');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getTaxSettings();
        setSettings(data);
        setRateInput(String(data.taxRate));
      } catch {
        toast.error('Failed to load tax settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    const rate = parseFloat(rateInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Tax rate must be between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateTaxSettings({
        ...settings,
        taxRate: rate,
      });
      setSettings(updated);
      setRateInput(String(updated.taxRate));
      toast.success('Tax settings saved successfully');
    } catch {
      toast.error('Failed to save tax settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-tea"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Tax Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure the tax rate applied to customer orders at checkout.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">

        {/* Enable / Disable Tax */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enable Tax</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              When disabled, no tax will be applied to any order.
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, taxEnabled: !prev.taxEnabled }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              settings.taxEnabled ? 'bg-primary-tea' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                settings.taxEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Tax Rate */}
        <div className={`space-y-2 transition-opacity ${settings.taxEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Rate (%)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              className="w-36 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-tea text-lg font-semibold"
            />
            <span className="text-2xl text-gray-500 dark:text-gray-400 font-light">%</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Enter a value between 0 and 100. For example, enter <strong>8</strong> for 8% tax.
          </p>
        </div>

        {/* Tax Label */}
        <div className={`space-y-2 transition-opacity ${settings.taxEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tax Label
          </label>
          <input
            type="text"
            value={settings.taxLabel}
            onChange={(e) => setSettings(prev => ({ ...prev, taxLabel: e.target.value }))}
            placeholder="e.g. Tax, Sales Tax, VAT"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-tea"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            This label appears next to the tax amount on the cart and checkout pages.
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal</span>
              <span>$20.00</span>
            </div>
            {settings.taxEnabled && (
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>{settings.taxLabel || 'Tax'} ({parseFloat(rateInput) || 0}%)</span>
                <span>${((20 * (parseFloat(rateInput) || 0)) / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Delivery Fee</span>
              <span>$2.99</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
              <span>Total</span>
              <span>
                ${(20 + (settings.taxEnabled ? (20 * (parseFloat(rateInput) || 0)) / 100 : 0) + 2.99).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary-tea text-white rounded-lg font-semibold hover:bg-accent-tea transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTaxSettings;
