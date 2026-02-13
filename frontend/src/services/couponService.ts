import axiosInstance from '../utils/axios';

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  expirationDate: string;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResponse {
  coupon: Coupon;
  discountAmount: number;
  finalAmount: number;
}

// Get all active coupons (public)
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get('/coupons/active');
  return response.data.data;
};

// Get all coupons (admin only)
export const getAllCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get('/coupons');
  return response.data.data;
};

// Get single coupon (admin only)
export const getCoupon = async (id: string): Promise<Coupon> => {
  const response = await axiosInstance.get(`/coupons/${id}`);
  return response.data.data;
};

// Create new coupon (admin only)
export const createCoupon = async (couponData: Partial<Coupon>): Promise<Coupon> => {
  const response = await axiosInstance.post('/coupons', couponData);
  return response.data.data;
};

// Update coupon (admin only)
export const updateCoupon = async (id: string, couponData: Partial<Coupon>): Promise<Coupon> => {
  const response = await axiosInstance.put(`/coupons/${id}`, couponData);
  return response.data.data;
};

// Delete coupon (admin only)
export const deleteCoupon = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/coupons/${id}`);
};

// Validate coupon
export const validateCoupon = async (code: string, orderAmount: number): Promise<CouponValidationResponse> => {
  const response = await axiosInstance.post('/coupons/validate', { code, orderAmount });
  return response.data.data;
};

// Apply coupon (increment usage count)
export const applyCoupon = async (id: string): Promise<Coupon> => {
  const response = await axiosInstance.post(`/coupons/${id}/apply`);
  return response.data.data;
};