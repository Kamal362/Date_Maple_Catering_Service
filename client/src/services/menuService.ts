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

// Create a new menu item with file upload support
export const createMenuItem = async (menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
  // If the data contains a file, we need to send it as FormData
  if (menuItemData.image instanceof File) {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.entries(menuItemData).forEach(([key, value]) => {
      if (key === 'dietary' || key === 'altMilkOptions') {
        // Stringify arrays
        formData.append(key, JSON.stringify(value));
      } else if (key === 'image' && value instanceof File) {
        // Append file
        formData.append(key, value);
      } else if (typeof value !== 'object' || value === null) {
        // Append primitive values
        formData.append(key, value as string | Blob);
      }
    });
    
    // Create a new axios instance for FormData
    const formDataAxios = axiosInstance;
    
    const response = await formDataAxios.post('/menu', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  } else {
    // Regular JSON request
    const response = await axiosInstance.post('/menu', menuItemData);
    return response.data.data;
  }
};

// Update an existing menu item with file upload support
export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
  // If the data contains a file, we need to send it as FormData
  if (updates.image instanceof File) {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'dietary' || key === 'altMilkOptions') {
        // Stringify arrays
        formData.append(key, JSON.stringify(value));
      } else if (key === 'image' && value instanceof File) {
        // Append file
        formData.append(key, value);
      } else if (typeof value !== 'object' || value === null) {
        // Append primitive values
        formData.append(key, value as string | Blob);
      }
    });
    
    // Create a new axios instance for FormData
    const formDataAxios = axiosInstance;
    
    const response = await formDataAxios.put(`/menu/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  } else {
    // Regular JSON request
    const response = await axiosInstance.put(`/menu/${id}`, updates);
    return response.data.data;
  }
};

// Delete a menu item
export const deleteMenuItem = async (id: string): Promise<void> => {
  const response = await axiosInstance.delete(`/menu/${id}`);
  return response.data.data;
};