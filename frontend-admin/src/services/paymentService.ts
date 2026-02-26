import apiClient from '../utils/axios';

// Payment method interface
export interface PaymentMethod {
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
  createdAt?: string;
  updatedAt?: string;
}

// Get all active payment methods (public)
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiClient.get('/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Get all payment methods (admin)
export const getAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiClient.get('/payment-methods/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching all payment methods:', error);
    throw error;
  }
};

// Create a new payment method (admin)
export const createPaymentMethod = async (paymentMethod: Omit<PaymentMethod, '_id'>): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.post('/payment-methods/admin', paymentMethod);
    return response.data;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Update a payment method (admin)
export const updatePaymentMethod = async (id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  try {
    const response = await apiClient.put(`/payment-methods/admin/${id}`, paymentMethod);
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Delete a payment method (admin)
export const deletePaymentMethod = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/payment-methods/admin/${id}`);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};