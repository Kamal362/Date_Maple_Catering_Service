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
    console.log('Syncing cart with backend:', frontendCartItems);
    
    // First, try to get existing cart to ensure it exists
    try {
      await getCart();
    } catch (error: any) {
      // If cart doesn't exist, the getCart call will fail
      console.log('Cart doesn\'t exist, will be created during sync');
    }
    
    // Clear existing backend cart if it exists
    try {
      await axiosInstance.delete('/cart');
      console.log('Existing cart cleared');
    } catch (error) {
      console.log('No existing cart to clear');
    }
    
    // Add each frontend item to backend cart
    if (frontendCartItems.length > 0) {
      console.log('Adding items to cart:', frontendCartItems.length);
      
      // Filter out items with invalid IDs first
      console.log('Raw frontend cart items:', frontendCartItems);
      
      const validItems = frontendCartItems.filter(item => {
        // Handle both id and _id properties after transformation
        const menuItemId = item.id; // After transformation, items should have proper 'id' field
        
        // Detailed item analysis
        const itemAnalysis = {
          name: item.name,
          id: item.id,
          _id: item._id,
          menuItemId: menuItemId,
          idType: typeof menuItemId,
          idLength: typeof menuItemId === 'string' ? menuItemId.length : 'N/A',
          isHexString: typeof menuItemId === 'string' ? /^[0-9a-fA-F]{24}$/.test(menuItemId) : false,
          meetsCriteria: menuItemId && 
                        typeof menuItemId === 'string' && 
                        menuItemId.length === 24 && 
                        /^[0-9a-fA-F]{24}$/.test(menuItemId) &&
                        item.name && item.name.length > 0 // Additional validation
        };
        
        console.log('Item analysis:', itemAnalysis);
        
        // Keep items with valid MongoDB ObjectIds (24 hex chars)
        return itemAnalysis.meetsCriteria;
      });
      
      console.log(`Filtered items: ${validItems.length} valid out of ${frontendCartItems.length} total`);
      
      if (validItems.length === 0) {
        console.warn('No valid items found for cart sync');
        // Clear frontend cart if all items are invalid
        localStorage.removeItem('cart');
        console.log('Cleared invalid frontend cart');
        return false;
      }
      
      // Process valid items sequentially
      let successfulAdds = 0;
      for (const item of validItems) {
        try {
          const menuItemId = item._id || item.id;
          
          console.log('Attempting to add item to backend cart:', { 
            name: item.name, 
            menuItemId: menuItemId,
            quantity: item.quantity
          });
          
          await addItemToCart({
            menuItemId: menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
            selectedSize: item.selectedSize,
            selectedMilk: item.selectedMilk,
            addColdFoam: item.addColdFoam
          });
          
          successfulAdds++;
          console.log('Successfully added item to cart:', item.name);
        } catch (error: any) {
          console.error('Failed to add item to cart:', item.name, error.message);
          // Don't stop processing other items
        }
      }
      
      console.log(`Cart sync completed: ${successfulAdds}/${validItems.length} items added successfully`);
      
      if (successfulAdds === 0) {
        console.warn('No items were successfully added to backend cart');
        return false;
      }
      
      return true;
    } else {
      console.log('No items to sync');
      return false;
    }
    
    console.log('Cart synced successfully');
    return true;
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