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
      <div className="space-y-4">
        <div>
          <label className="block text-dark-tea mb-2">Vendor</label>
          <select
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white"
          >
            <option value="Venmo">Venmo</option>
            <option value="Cash App">Cash App</option>
            <option value="Zelle">Zelle</option>
          </select>
        </div>
        
        <div>
          <label className="block text-dark-tea mb-2">Account Name</label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Account holder name"
            required
          />
        </div>
        
        <div>
          <label className="block text-dark-tea mb-2">
            {formData.vendor === 'Zelle' ? 'Phone Number' : 'Account Alias'}
          </label>
          <input
            type="text"
            name="accountAlias"
            value={formData.accountAlias}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder={formData.vendor === 'Zelle' ? 'Phone number' : '@username'}
          />
        </div>
        
        {formData.vendor === 'Zelle' && (
          <div>
            <label className="block text-dark-tea mb-2">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="Phone number"
            />
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive ?? true}
            onChange={handleChange}
            className="mr-2 h-5 w-5 text-primary-tea rounded focus:ring-primary-tea"
          />
          <label className="text-dark-tea">Active</label>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary px-6 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2"
        >
          {paymentMethod ? 'Update' : 'Add'} Payment Method
        </button>
      </div>
    </form>
  );
};

export default PaymentMethodForm;