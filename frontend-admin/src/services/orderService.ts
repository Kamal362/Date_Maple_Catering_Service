import apiClient from '../utils/axios';
import axios from 'axios';

// Order interface
export interface Order {
  _id: string;
  orderId?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    menuItem: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  orderType: string;
  paymentMethod: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentReceipt?: string;
  deliveryFee?: number;
  tax?: number;
  createdAt: string;
  updatedAt: string;
}

// Create a new order
export const createOrder = async (formData: FormData): Promise<{success: boolean, data?: Order, message?: string}> => {
  try {
    // Create a new axios instance for form data
    const formApiClient = axios.create({
      baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/checkout`,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add auth token to requests if available
    formApiClient.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    const response = await formApiClient.post('/', formData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get all orders (Admin only)
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await apiClient.get('/orders');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get orders for logged in user
export const getMyOrders = async (): Promise<Order[]> => {
  try {
    const response = await apiClient.get('/orders/myorders');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching my orders:', error);
    throw error;
  }
};

// Get single order
export const getOrder = async (id: string): Promise<Order> => {
  try {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  try {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update payment status (Admin only)
export const updatePaymentStatus = async (id: string, paymentStatus: string, paymentReceipt?: string): Promise<Order> => {
  try {
    const response = await apiClient.put(`/orders/${id}/payment`, { paymentStatus, paymentReceipt });
    return response.data.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Cancel order (User can cancel pending orders)
export const cancelOrder = async (id: string): Promise<Order> => {
  try {
    const response = await apiClient.put(`/orders/${id}/cancel`);
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Delete order (Admin only)
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/orders/${id}`);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};