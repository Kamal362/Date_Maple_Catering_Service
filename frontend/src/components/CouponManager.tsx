import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/couponService';
import { Coupon } from '../services/couponService';

const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minimumOrderAmount: '',
    expirationDate: '',
    maxUses: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const newCoupon = await createCoupon({
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
        expirationDate: formData.expirationDate,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        isActive: true
      });
      
      setCoupons([newCoupon, ...coupons]);
      toast.success('Coupon created successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create coupon';
      toast.error(errorMessage);
    }
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;
    
    try {
      const updatedCoupon = await updateCoupon(editingCoupon._id, {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
        expirationDate: formData.expirationDate,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null
      });
      
      setCoupons(coupons.map(coupon => 
        coupon._id === editingCoupon._id ? updatedCoupon : coupon
      ));
      toast.success('Coupon updated successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update coupon';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter(coupon => coupon._id !== id));
      toast.success('Coupon deleted successfully');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      expirationDate: '',
      maxUses: ''
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrderAmount: coupon.minimumOrderAmount.toString(),
      expirationDate: coupon.expirationDate.split('T')[0],
      maxUses: coupon.maxUses?.toString() || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      handleUpdateCoupon();
    } else {
      handleCreateCoupon();
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue}`;
    }
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-tea"></div>
        <span className="ml-2">Loading coupons...</span>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-semibold text-primary-tea">Coupon Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add New Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-cream rounded-lg border border-secondary-tea">
          <h3 className="text-xl font-heading font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dark-tea font-medium mb-2">Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder="e.g., SAVE10"
                required
              />
            </div>
            
            <div>
              <label className="block text-dark-tea font-medium mb-2">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({...formData, discountType: e.target.value as 'percentage' | 'fixed'})}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-dark-tea font-medium mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder={formData.discountType === 'percentage' ? '10' : '5.00'}
                required
              />
              <div className="text-xs text-secondary-tea mt-1">
                {formData.discountType === 'percentage' ? 'Enter percentage discount' : 'Enter dollar amount discount'}
              </div>
            </div>
            
            <div>
              <label className="block text-dark-tea font-medium mb-2">Minimum Order Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minimumOrderAmount}
                onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder="0.00"
              />
              <div className="text-xs text-secondary-tea mt-1">
                Minimum order amount in USD ($)
              </div>
            </div>
            
            <div>
              <label className="block text-dark-tea font-medium mb-2">Expiration Date *</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-dark-tea font-medium mb-2">Max Uses (optional)</label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder="Unlimited"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
            >
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-tea bg-cream">
              <th className="text-left py-3 px-4 font-semibold">Code</th>
              <th className="text-left py-3 px-4 font-semibold">Discount</th>
              <th className="text-left py-3 px-4 font-semibold">Min Order</th>
              <th className="text-left py-3 px-4 font-semibold">Expires</th>
              <th className="text-left py-3 px-4 font-semibold">Usage</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-secondary-tea hover:bg-light-tea">
                  <td className="py-3 px-4 font-mono font-bold">{coupon.code}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{getDiscountDisplay(coupon)}</span>
                  </td>
                  <td className="py-3 px-4">
                    {coupon.minimumOrderAmount > 0 ? `$${coupon.minimumOrderAmount}` : 'None'}
                  </td>
                  <td className="py-3 px-4">
                    <div className={isExpired(coupon.expirationDate) ? 'text-red-600' : ''}>
                      {new Date(coupon.expirationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {coupon.maxUses ? (
                      <span className={coupon.usedCount >= coupon.maxUses ? 'text-red-600' : ''}>
                        {coupon.usedCount}/{coupon.maxUses}
                      </span>
                    ) : (
                      <span>{coupon.usedCount} (Unlimited)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      !coupon.isActive || isExpired(coupon.expirationDate) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {!coupon.isActive ? 'Inactive' : 
                       isExpired(coupon.expirationDate) ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-secondary-tea">
                  <p>No coupons found. Create your first coupon!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponManager;