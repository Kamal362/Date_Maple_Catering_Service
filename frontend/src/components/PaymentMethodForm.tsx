import React, { useState } from 'react';

interface PaymentMethod {
  _id?: string;
  vendor: string;
  accountName: string;
  accountNumber: string;
  accountAlias: string;
  isActive: boolean;
}

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethod | null;
  onSave: (method: PaymentMethod) => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ paymentMethod, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PaymentMethod>(
    paymentMethod ? {
      ...paymentMethod,
      isActive: paymentMethod.isActive ?? true
    } : {
      _id: '',
      vendor: 'Venmo',
      accountName: '',
      accountNumber: '',
      accountAlias: '',
      isActive: true
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Vendor *</label>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white transition-all duration-200 hover:border-primary-tea"
            required
          >
            <option value="">Select payment vendor</option>
            <option value="Venmo">Venmo</option>
            <option value="Cash App">Cash App</option>
            <option value="Zelle">Zelle</option>
          </select>
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Account Name *</label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder="Enter account holder name"
            required
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">
            {formData.vendor === 'Zelle' ? 'Phone Number' : 'Account Alias'} *
          </label>
          <input
            type="text"
            name="accountAlias"
            value={formData.accountAlias}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder={formData.vendor === 'Zelle' ? 'Enter phone number' : 'Enter @username'}
            required
          />
        </div>
        
        {formData.vendor === 'Zelle' && (
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Account Number *</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder="Enter phone number"
              required
            />
          </div>
        )}
        
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive ?? true}
            onChange={handleChange}
            className="h-5 w-5 text-primary-tea rounded focus:ring-2 focus:ring-primary-tea border-secondary-tea"
          />
          <label className="ml-3 text-dark-tea font-medium">Set as Active Payment Method</label>
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