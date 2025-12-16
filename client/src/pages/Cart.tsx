import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="section-padding bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto text-secondary-tea mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h2 className="text-3xl font-heading font-bold text-primary-tea mb-4">Your Cart is Empty</h2>
          <p className="text-dark-tea mb-8">Add some delicious items from our menu!</p>
          <Link to="/menu" className="btn-primary">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary-tea">Shopping Cart</h1>
          <button 
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center p-6 border-b border-light-tea">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-grow ml-6">
                    <h3 className="text-xl font-heading font-semibold text-primary-tea mb-2">
                      {item.name}
                    </h3>
                    <p className="text-dark-tea text-sm mb-2">{item.description}</p>
                    <p className="text-lg font-bold text-gold">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-secondary-tea rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 text-primary-tea hover:bg-light-tea transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 text-primary-tea hover:bg-light-tea transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-heading font-semibold text-primary-tea mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-dark-tea">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-dark-tea">
                  <span>Tax (8%)</span>
                  <span>${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-secondary-tea pt-4">
                  <div className="flex justify-between text-xl font-bold text-primary-tea">
                    <span>Total</span>
                    <span>${(cartTotal * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full block text-center mb-4">
                Proceed to Checkout
              </Link>
              
              <Link to="/menu" className="btn-secondary w-full block text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;