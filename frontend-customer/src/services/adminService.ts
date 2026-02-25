import axiosInstance from '../utils/axios';

const apiClient = axiosInstance;

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (id: string, updates: any) => {
  try {
    const response = await apiClient.put(`/admin/users/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getRecentOrders = async () => {
  try {
    const response = await apiClient.get('/admin/orders/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const getRecentEvents = async () => {
  try {
    const response = await apiClient.get('/admin/events/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent events:', error);
    throw error;
  }
};