import axios from 'axios';

// Use relative URL for proxy
const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAllUsers = async () => {
  try {
    console.log('Fetching users from:', `${API_URL}/admin/users`);
    const response = await axios.get(`${API_URL}/admin/users`, getAuthHeader());
    console.log('Users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (id: string, updates: any) => {
  try {
    const response = await axios.put(`${API_URL}/admin/users/${id}`, updates, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await axios.post(`${API_URL}/admin/users`, userData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    console.log('Fetching admin stats from:', `${API_URL}/admin/stats`);
    const response = await axios.get(`${API_URL}/admin/stats`, getAuthHeader());
    console.log('Stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getRecentOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/orders/recent`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export const getRecentEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/events/recent`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching recent events:', error);
    throw error;
  }
};