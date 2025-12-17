import axiosInstance from '../utils/axios';
import { MenuItem } from '../types/menu';

// Get all menu items
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const response = await axiosInstance.get('/menu');
  return response.data.data;
};

// Get menu items by category
export const getMenuItemsByCategory = async (category: string): Promise<MenuItem[]> => {
  const response = await axiosInstance.get(`/menu/category/${category}`);
  return response.data.data;
};

// Create a new menu item
export const createMenuItem = async (menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await axiosInstance.post('/menu', menuItemData);
  return response.data.data;
};

// Update an existing menu item
export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await axiosInstance.put(`/menu/${id}`, updates);
  return response.data.data;
};

// Delete a menu item
export const deleteMenuItem = async (id: string): Promise<void> => {
  const response = await axiosInstance.delete(`/menu/${id}`);
  return response.data.data;
};