import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import { getTaxSettings, TaxSettings } from '../services/taxService';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({ taxEnabled: true, taxRate: 8, taxLabel: 'Tax' });

  useEffect(() => {
    getTaxSettings().then(setTaxSettings);
  }, []);

  const taxRate = taxSettings.taxEnabled ? taxSettings.taxRate / 100 : 0;
  const taxAmount = cartTotal * taxRate;
  const deliveryFee = 2.99;
  const total = cartTotal + taxAmount + deliveryFee;
  const getItemKey = (item: CartItem, index: number): string => {
    return item.customization
      ? `${item.id}-${item.customization.size || ''}-${(item.customization.extras || []).join(',')}-${index}`
      : `${item.id}-${index}`;
  };

  const handleRemoveItemClick = (itemId: string) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };

  const confirmRemoveItem = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete);
      setItemToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <PageHero 
        title="Your Cart" 
        subtitle="Review your selected items before checkout"
        height="sm"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {cartItems.length === 0 ? (
          <ScrollReveal direction="up">
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-soft max-w-md mx-auto">
              <svg className="w-20 h-20 mx-auto mb-4 text-secondary-tea dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-2xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-3">Your cart is empty</h2>
              <p className="text-secondary-tea dark:text-gray-400 mb-6 px-4">Looks like you haven't added any items to your cart yet.</p>
              <Link to="/menu" className="btn-primary inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Browse Menu
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="up">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Cart Items ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                    </h2>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {cartItems.map((item, index) => {
                        const itemKey = getItemKey(item, index);
                        
                        return (
                          <div key={itemKey} className="flex items-center border-b border-secondary-tea/30 dark:border-gray-700 pb-4 sm:pb-6 last:border-b-0 group hover:bg-cream/50 dark:hover:bg-gray-700/50 transition-colors rounded-lg p-2 -mx-2">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                              <img 
                                src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="ml-3 sm:ml-4 flex-grow min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="text-base sm:text-lg font-heading font-bold text-dark-tea dark:text-gray-200 truncate pr-2">{item.name}</h3>
                                <button 
                                  onClick={() => handleRemoveItemClick(itemKey)}
                                  className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors flex-shrink-0"
                                  aria-label="Remove item"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Customization details */}
                              {item.customization && (
                                <div className="text-xs sm:text-sm text-secondary-tea dark:text-gray-400 mt-1 space-y-0.5">
                                  {item.customization.size && (
                                    <span className="inline-block mr-2">Size: <strong>{item.customization.size}</strong></span>
                                  )}
                                  {item.customization.milk && item.customization.milk !== 'regular' && (
                                    <span className="inline-block mr-2">Milk: <strong>{item.customization.milk}</strong></span>
                                  )}
                                  {item.customization.extras && item.customization.extras.length > 0 && (
                                    <div>Extras: <strong>{item.customization.extras.join(', ')}</strong></div>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-secondary-tea dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-1 hidden sm:block">{item.description}</p>
                              
                              <div className="flex items-center justify-between mt-2 sm:mt-3">
                                <div className="flex items-center">
                                  <button 
                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center border border-secondary-tea dark:border-gray-600 rounded-l-lg bg-cream dark:bg-gray-700 hover:bg-light-tea dark:hover:bg-gray-600 transition-colors text-dark-tea dark:text-gray-200"
                                  >
                                    -
                                  </button>
                                  <span className="w-10 sm:w-12 h-8 flex items-center justify-center border-t border-b border-secondary-tea dark:border-gray-600 bg-cream dark:bg-gray-700 text-dark-tea dark:text-gray-200 font-medium text-sm">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center border border-secondary-tea dark:border-gray-600 rounded-r-lg bg-cream dark:bg-gray-700 hover:bg-light-tea dark:hover:bg-gray-600 transition-colors text-dark-tea dark:text-gray-200"
                                  >
                                    +
                                  </button>
                                </div>
                                
                                <div className="text-base sm:text-lg font-bold text-primary-tea">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <ScrollReveal direction="up" delay={150}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-4 sm:p-6 sticky top-24">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-secondary-tea dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-dark-tea dark:text-gray-200">${cartTotal.toFixed(2)}</span>
                    </div>
                    {taxSettings.taxEnabled && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-secondary-tea dark:text-gray-400">{taxSettings.taxLabel} ({taxSettings.taxRate}%)</span>
                        <span className="font-medium text-dark-tea dark:text-gray-200">${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-secondary-tea dark:text-gray-400">Delivery Fee</span>
                      <span className="font-medium text-dark-tea dark:text-gray-200">${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-secondary-tea/30 dark:border-gray-700 pt-4 flex justify-between text-lg sm:text-xl font-bold">
                      <span className="text-dark-tea dark:text-gray-200">Total</span>
                      <span className="text-primary-tea">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/checkout" 
                    className="btn-primary w-full text-center py-3 sm:py-4 block text-base sm:text-lg font-semibold rounded-xl btn-glow"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <Link 
                    to="/menu" 
                    className="block text-center text-primary-tea hover:text-accent-tea mt-4 font-medium text-sm sm:text-base transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmRemoveItem}
        title="Remove Item from Cart"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        iconType="warning"
      />
    </div>
  );
};

export default Cart;