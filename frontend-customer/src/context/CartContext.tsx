
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '../types/menu';

export interface CartItem extends MenuItem {
  quantity: number;
  customization?: {
    size?: string;
    milk?: string;
    extras?: string[];
    quantity?: number;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemKey: string) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  getCartItemKey: (item: CartItem, index: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      // Validate it's an array of valid cart items
      if (!Array.isArray(parsed)) {
        localStorage.removeItem('cart');
        return [];
      }
      return parsed;
    } catch {
      localStorage.removeItem('cart');
      return [];
    }
  });

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: MenuItem & { customization?: any }) => {
    setCartItems((prevItems) => {
      // Create a unique key based on item id and customization
      const customizationKey = item.customization 
        ? `${item.id}-${item.customization.size || ''}-${(item.customization.extras || []).join(',')}`
        : item.id;
      
      const existingItemIndex = prevItems.findIndex((cartItem) => {
        const cartKey = cartItem.customization
          ? `${cartItem.id}-${cartItem.customization.size || ''}-${(cartItem.customization.extras || []).join(',')}`
          : cartItem.id;
        return cartKey === customizationKey;
      });
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        return prevItems.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + (item.customization?.quantity || 1) }
            : cartItem
        );
      }
      
      // Add new item
      return [...prevItems, { ...item, quantity: item.customization?.quantity || 1 }];
    });

    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const removeFromCart = (itemKey: string) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => `${prevItems[i].id}-${prevItems[i].customization?.size || ''}-${(prevItems[i].customization?.extras || []).join(',')}-${i}` !== itemKey && `${prevItems[i].id}-${i}` !== itemKey));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      const itemKey = getCartItemKey(cartItems[index], index);
      removeFromCart(itemKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Helper to get the unique key for a cart item (must match Cart.tsx)
  const getCartItemKey = (item: CartItem, index: number): string => {
    return item.customization
      ? `${item.id}-${item.customization.size || ''}-${(item.customization.extras || []).join(',')}-${index}`
      : `${item.id}-${index}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        getCartItemKey,
      }}
    >
      {children}
      
      {/* Cart notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-primary-tea text-cream px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Item added to cart!</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
