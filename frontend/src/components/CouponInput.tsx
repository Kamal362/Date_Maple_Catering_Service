import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { validateCoupon } from '../services/couponService';

interface CouponInputProps {
  orderAmount: number;
  onCouponApply: (couponData: { code: string; discount: number; finalAmount: number }) => void;
  onCouponRemove: () => void;
  appliedCoupon?: { code: string; discount: number };
}

const CouponInput: React.FC<CouponInputProps> = ({ 
  orderAmount, 
  onCouponApply, 
  onCouponRemove,
  appliedCoupon 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const toast = useToast();

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (appliedCoupon) {
      toast.warning('A coupon is already applied. Remove it first to apply a new one.');
      return;
    }

    try {
      setIsValidating(true);
      const result = await validateCoupon(couponCode.trim(), orderAmount);
      
      toast.success(`Coupon applied! You save $${result.discountAmount.toFixed(2)}`);
      
      onCouponApply({
        code: result.coupon.code,
        discount: result.discountAmount,
        finalAmount: result.finalAmount
      });
      
      setCouponCode('');
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid coupon code';
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
    toast.info('Coupon removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateCoupon();
    }
  };

  return (
    <div className="bg-cream rounded-lg p-4 border border-secondary-tea">
      <h3 className="text-lg font-heading font-semibold text-primary-tea mb-3">
        {appliedCoupon ? 'Applied Coupon' : 'Have a Coupon?'}
      </h3>
      
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-medium text-green-800">{appliedCoupon.code}</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You saved ${appliedCoupon.discount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleRemoveCoupon}
            disabled={isLoading}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              disabled={isValidating || isLoading}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea disabled:bg-gray-100"
            />
          </div>
          <button
            onClick={handleValidateCoupon}
            disabled={isValidating || isLoading || !couponCode.trim()}
            className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isValidating ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Applying...
              </span>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      )}
      
      <p className="text-sm text-secondary-tea mt-2">
        Enter your coupon code to get discounts on your order
      </p>
    </div>
  );
};

export default CouponInput;