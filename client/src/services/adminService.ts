
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
