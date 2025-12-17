import axios from 'axios';

const API_BASE_URL = '/api/orders';

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
  paymentStatus: string;
  paymentReceipt?: string;
  createdAt: string;
  updatedAt: string;
}

// Create a new order
export const createOrder = async (formData: FormData): Promise<{success: boolean, data?: Order, message?: string}> => {
  try {
    // Create a new axios instance for form data
    const formApiClient = axios.create({
      baseURL: '/api/checkout',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Add auth token to requests if available
    formApiClient.interceptors.request.use((config) => {
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
    const response = await apiClient.get('/');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get orders for logged in user
export const getMyOrders = async (): Promise<Order[]> => {
  try {
    const response = await apiClient.get('/myorders');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching my orders:', error);
    throw error;
  }
};

// Get single order
export const getOrder = async (id: string): Promise<Order> => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  try {
    const response = await apiClient.put(`/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update payment status (Admin only)
export const updatePaymentStatus = async (id: string, paymentStatus: string, paymentReceipt?: string): Promise<Order> => {
  try {
    const response = await apiClient.put(`/${id}/payment`, { paymentStatus, paymentReceipt });
    return response.data.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Delete order (Admin only)
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/${id}`);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};