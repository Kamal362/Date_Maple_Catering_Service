import axiosInstance from '../utils/axios';

// Get user's cart from backend
export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/cart');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add item to backend cart
export const addItemToCart = async (itemData: {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
  selectedSize?: string;
  selectedMilk?: string;
  addColdFoam?: boolean;
}) => {
  try {
    const response = await axiosInstance.post('/cart', itemData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Sync frontend localStorage cart with backend
export const syncCartWithBackend = async (frontendCartItems: any[]) => {
  try {
    // First, try to get existing cart to ensure it exists
    try {
      await getCart();
    } catch (error: any) {
      // If cart doesn't exist, it will be created during sync
    }
    
    // Clear existing backend cart if it exists
    try {
      await axiosInstance.delete('/cart');
    } catch (error) {
      // No existing cart to clear
    }
    
    // Add each frontend item to backend cart
    if (frontendCartItems.length > 0) {
      // Filter out items with invalid IDs
      const validItems = frontendCartItems.filter(item => {
        const menuItemId = item.id || item._id;
        return menuItemId &&
               typeof menuItemId === 'string' &&
               menuItemId.length === 24 &&
               /^[0-9a-fA-F]{24}$/.test(menuItemId) &&
               item.name && item.name.length > 0;
      });
      
      if (validItems.length === 0) {
        console.warn('No valid items found for cart sync');
        localStorage.removeItem('cart');
        return false;
      }
      
      // Process valid items sequentially
      let successfulAdds = 0;
      for (const item of validItems) {
        try {
          const menuItemId = item._id || item.id;
          
          await addItemToCart({
            menuItemId: menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
            selectedSize: item.selectedSize,
            selectedMilk: item.selectedMilk,
            addColdFoam: item.addColdFoam
          });
          
          successfulAdds++;
        } catch (error: any) {
          console.error('Failed to add item to cart:', item.name, error.message);
          // Don't stop processing other items
        }
      }
      
      if (successfulAdds === 0) {
        console.warn('No items were successfully added to backend cart');
        return false;
      }
      
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    const response = await axiosInstance.put(`/cart/${itemId}`, { quantity });
    return response.data.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
export const removeItemFromCart = async (itemId: string) => {
  try {
    const response = await axiosInstance.delete(`/cart/${itemId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete('/cart');
    return response.data.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};