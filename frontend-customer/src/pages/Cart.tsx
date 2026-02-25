import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="relative bg-primary-tea py-16">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4">Your Cart</h1>
          <p className="text-xl text-cream max-w-2xl mx-auto">
            Review your selected items before checkout
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-heading font-bold text-dark-tea mb-4">Your cart is empty</h2>
            <p className="text-secondary-tea mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/menu" className="btn-primary inline-block">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-heading font-bold text-dark-tea mb-6">Cart Items ({cartItems.reduce((total, item) => total + item.quantity, 0)})</h2>
                  
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center border-b border-secondary-tea pb-6 last:border-b-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          {/* Ensure image is a string before using it as src */}
                          <img 
                            src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-grow">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-heading font-bold text-dark-tea">{item.name}</h3>
                            <button 
                              onClick={() => handleRemoveItemClick(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                          
                          <p className="text-secondary-tea text-sm mt-1">{item.description}</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center border border-secondary-tea rounded-l-md bg-cream hover:bg-light-tea"
                              >
                                -
                              </button>
                              <span className="w-12 h-8 flex items-center justify-center border-t border-b border-secondary-tea bg-cream">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border border-secondary-tea rounded-r-md bg-cream hover:bg-light-tea"
                              >
                                +
                              </button>
                            </div>
                            
                            <div className="text-lg font-bold text-primary-tea">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-2xl font-heading font-bold text-dark-tea mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Tax</span>
                    <span className="font-medium">${(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Delivery Fee</span>
                    <span className="font-medium">$2.99</span>
                  </div>
                  <div className="border-t border-secondary-tea pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-tea">${(cartTotal * 1.08 + 2.99).toFixed(2)}</span>
                  </div>
                </div>
                
                <Link 
                  to="/checkout" 
                  className="btn-primary w-full text-center py-3 block text-lg font-semibold"
                >
                  Proceed to Checkout
                </Link>
                
                <Link 
                  to="/menu" 
                  className="block text-center text-primary-tea hover:text-accent-tea mt-4 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
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