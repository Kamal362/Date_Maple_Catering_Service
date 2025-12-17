
import React, { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuService';

// ... rest of your component

const handleAddMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  try {
    const formData = new FormData(e.currentTarget);
    const newItem = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      image: formData.get('image') as string,
      available: formData.get('available') === 'true'
    };

    await createMenuItem(newItem);
    
    // Refresh the menu items list
    fetchMenuItems();
    
    // Close modal or reset form
    setShowAddModal(false);
    e.currentTarget.reset();
  } catch (err: any) {
    console.error('Error adding menu item:', err);
    alert(err.response?.data?.message || 'Failed to add menu item');
  }
};
