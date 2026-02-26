import React, { useState } from 'react';

interface PaymentMethod {
  _id?: string;
  type: string;
  vendor: string;
  accountName: string;
  accountNumber: string;
  accountAlias: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  description?: string;
  instructions?: string;
  isActive: boolean;
  displayOrder?: number;
}

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethod | null;
  onSave: (method: PaymentMethod) => void;
  onCancel: () => void;
}

const paymentTypeOptions = [
  { value: 'digital_wallet', label: 'Digital Wallet', vendors: ['Venmo', 'Cash App', 'Zelle', 'PayPal', 'Apple Pay', 'Google Pay'] },
  { value: 'credit_card', label: 'Credit Card', vendors: ['Visa', 'Mastercard', 'American Express', 'Discover'] },
  { value: 'bank_transfer', label: 'Bank Transfer', vendors: ['Wire Transfer', 'ACH', 'Direct Deposit'] },
  { value: 'cash', label: 'Cash', vendors: ['Cash on Delivery', 'In-Store Cash'] },
  { value: 'other', label: 'Other', vendors: ['Custom'] }
];

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ paymentMethod, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PaymentMethod>(
    paymentMethod ? {
      ...paymentMethod,
      isActive: paymentMethod.isActive ?? true
    } : {
      _id: '',
      type: 'digital_wallet',
      vendor: 'Venmo',
      accountName: '',
      accountNumber: '',
      accountAlias: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      description: '',
      instructions: '',
      isActive: true,
      displayOrder: 0
    }
  );

  const [selectedType, setSelectedType] = useState(formData.type || 'digital_wallet');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    
    // Set default vendor based on type
    const defaultVendors: Record<string, string> = {
      digital_wallet: 'Venmo',
      credit_card: 'Visa',
      bank_transfer: 'Wire Transfer',
      cash: 'Cash on Delivery',
      other: 'Custom'
    };
    
    setFormData({
      ...formData,
      type: newType,
      vendor: defaultVendors[newType] || 'Custom'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getVendorOptions = () => {
    const typeOption = paymentTypeOptions.find(t => t.value === selectedType);
    return typeOption ? typeOption.vendors : [];
  };

  const isCreditCard = selectedType === 'credit_card';
  const isDigitalWallet = selectedType === 'digital_wallet';
  const isBankTransfer = selectedType === 'bank_transfer';

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* Payment Type */}
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Payment Type *</label>
          <select
            name="type"
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white transition-all duration-200 hover:border-primary-tea"
            required
          >
            {paymentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Vendor/Provider *</label>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white transition-all duration-200 hover:border-primary-tea"
            required
          >
            {getVendorOptions().map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
        </div>
        
        {/* Account Name */}
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">
            {isCreditCard ? 'Cardholder Name' : 'Account Name'} *
          </label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder={isCreditCard ? 'Enter cardholder name' : 'Enter account holder name'}
            required
          />
        </div>

        {/* Credit Card Fields */}
        {isCreditCard && (
          <>
            <div>
              <label className="block text-dark-tea text-sm font-medium mb-2">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                placeholder="**** **** **** ****"
                maxLength={19}
              />
              <p className="text-xs text-gray-500 mt-1">Optional - Enter last 4 digits only for security (e.g., **** **** **** 1234)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">Expiry Date</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={formData.cardExpiry || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">CVV</label>
                <input
                  type="text"
                  name="cardCvv"
                  value={formData.cardCvv || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                  placeholder="***"
                  maxLength={4}
                />
              </div>
            </div>
          </>
        )}
        
        {/* Digital Wallet Fields */}
        {isDigitalWallet && (
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">
              {formData.vendor === 'Zelle' ? 'Phone Number / Email' : 'Username / ID'} *
            </label>
            <input
              type="text"
              name="accountAlias"
              value={formData.accountAlias}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder={formData.vendor === 'Zelle' ? 'Enter phone or email' : 'Enter @username or ID'}
              required
            />
          </div>
        )}

        {/* Bank Transfer Fields */}
        {isBankTransfer && (
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Account/Routing Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder="Enter account or routing number"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder="Brief description of this payment method"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Payment Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder="Instructions for customers on how to use this payment method"
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Display Order</label>
          <input
            type="number"
            name="displayOrder"
            value={formData.displayOrder || 0}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder="0"
            min={0}
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>
        
        {/* Active Status */}
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive ?? true}
            onChange={handleChange}
            className="h-5 w-5 text-primary-tea rounded focus:ring-2 focus:ring-primary-tea border-secondary-tea"
          />
          <label className="ml-3 text-dark-tea font-medium">Active Payment Method</label>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-secondary-tea flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          {paymentMethod ? 'Update Payment Method' : 'Add Payment Method'}
        </button>
      </div>
    </form>
  );
};

export default PaymentMethodForm;