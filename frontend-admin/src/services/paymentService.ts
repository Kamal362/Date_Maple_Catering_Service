import axios from 'axios';

const API_BASE_URL = '/api/payment-methods';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Payment method interface
export interface PaymentMethod {
  _id?: string;
  vendor: string;
  accountName: string;
  accountNumber: string;
  accountAlias: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all active payment methods (public)
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Get all payment methods (admin)
export const getAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiClient.get('/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching all payment methods:', error);
    throw error;
  }
};

// Create a new payment method (admin)
export const createPaymentMethod = async (paymentMethod: Omit<PaymentMethod, '_id'>): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.post('/admin', paymentMethod);
    return response.data;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Update a payment method (admin)
export const updatePaymentMethod = async (id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.put(`/admin/${id}`, paymentMethod);
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Delete a payment method (admin)
export const deletePaymentMethod = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/${id}`);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};