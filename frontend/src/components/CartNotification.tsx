
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const CartNotification: React.FC = () => {
  const { cartItems, cartCount } = useCart();
  const [showNotification, setShowNotification] = useState(false);
  
  // Show notification when cart count changes
  useEffect(() => {
    if (cartCount > 0) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-primary-tea text-cream px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-accent-tea animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium">Item added to cart!</p>
        </div>
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CartNotification;
