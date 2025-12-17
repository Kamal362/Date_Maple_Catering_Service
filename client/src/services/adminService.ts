
import axios from 'axios';

// Use window.location.origin to dynamically determine the base URL
const API_URL = `${window.location.origin}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/admin/users`, getAuthHeader());
  return response.data;
};

export const updateUser = async (id: string, updates: any) => {
  const response = await axios.put(`${API_URL}/admin/users/${id}`, updates, getAuthHeader());
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axios.delete(`${API_URL}/admin/users/${id}`, getAuthHeader());
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await axios.post(`${API_URL}/admin/users`, userData, getAuthHeader());
  return response.data;
};

export const getAdminStats = async () => {
  const response = await fetch(`${API_URL}/admin/stats`);
  return response.json();
};

export const getRecentOrders = async () => {
  const response = await fetch(`${API_URL}/admin/recent-orders`);
  return response.json();
};

export const getRecentEvents = async () => {
  const response = await fetch(`${API_URL}/admin/recent-events`);
  return response.json();
};
