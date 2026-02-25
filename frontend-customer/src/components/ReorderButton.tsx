import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Order } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types/menu';

interface ReorderButtonProps {
  order: Order;
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: () => void;
}

const ReorderButton: React.FC<ReorderButtonProps> = ({ 
  order, 
  size = 'md',
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const handleReorder = async () => {
    try {
      setLoading(true);
      
      // Add all items from the order to cart
      let itemsAdded = 0;
      
      for (const item of order.items) {
        if (item.menuItem) {
          // Create MenuItem object compatible with CartContext
          // Type assertion since we know the populated object has these properties
          const populatedItem = item.menuItem as any;
          
          const menuItem: MenuItem = {
            id: populatedItem._id || Math.random().toString(36).substr(2, 9),
            name: populatedItem.name,
            price: item.price,
            description: populatedItem.description || '',
            category: populatedItem.category || 'ordered-item',
            image: populatedItem.image || '',
            available: populatedItem.available !== undefined ? populatedItem.available : true
          };
          
          // Add item multiple times based on quantity
          for (let i = 0; i < item.quantity; i++) {
            addToCart(menuItem);
            itemsAdded++;
          }
        }
      }
      
      toast.success(`Added ${itemsAdded} items to your cart!`);
      
      // Navigate to cart
      navigate('/cart');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setLoading(false);
    }
  };

  // Don't show reorder button for pending or cancelled orders
  if (order.status === 'pending' || order.status === 'cancelled') {
    return null;
  }

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className={`${sizeClasses[size]} bg-primary-tea text-cream rounded-md hover:bg-dark-tea transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Reorder
        </>
      )}
    </button>
  );
};

export default ReorderButton;