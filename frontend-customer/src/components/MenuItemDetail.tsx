import React, { useState } from 'react';
import { MenuItem } from '../types/menu';
import { useCart } from '../context/CartContext';

interface MenuItemDetailProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemDetail: React.FC<MenuItemDetailProps> = ({ 
  item, 
  isOpen, 
  onClose,
  onAddToCart 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedMilk, setSelectedMilk] = useState('regular');

  if (!isOpen) return null;

  const handleAddToCart = () => {
    const itemWithCustomization = {
      ...item,
      customization: {
        size: selectedSize,
        milk: selectedMilk,
        quantity
      }
    };
    onAddToCart(itemWithCustomization);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Image */}
              <div className="flex-shrink-0 w-full sm:w-1/3 mb-4 sm:mb-0 sm:mr-6">
                <img
                  src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'}
                  alt={item.name}
                  className="w-full h-48 sm:h-64 object-cover rounded-lg"
                />
              </div>
              
              {/* Content */}
              <div className="sm:w-2/3">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-2xl leading-6 font-heading font-bold text-dark-tea">
                    {item.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-secondary-tea">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-primary-tea">
                      ${(item.price * quantity).toFixed(2)}
                    </span>
                    {quantity > 1 && (
                      <span className="text-secondary-tea ml-2">
                        (${item.price.toFixed(2)} each)
                      </span>
                    )}
                  </div>

                  {/* Customization Options */}
                  {item.category === 'drinks' && (
                    <div className="mt-6 space-y-4">
                      {/* Size Selection */}
                      <div>
                        <label className="block text-sm font-medium text-dark-tea mb-2">
                          Size
                        </label>
                        <div className="flex gap-2">
                          {['small', 'regular', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 rounded-lg border transition-colors ${
                                selectedSize === size
                                  ? 'bg-primary-tea text-cream border-primary-tea'
                                  : 'border-secondary-tea text-dark-tea hover:border-primary-tea'
                              }`}
                            >
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Milk Selection */}
                      {item.altMilkOptions && item.altMilkOptions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-dark-tea mb-2">
                            Milk Type
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['regular', ...item.altMilkOptions].map((milk) => (
                              <button
                                key={milk}
                                onClick={() => setSelectedMilk(milk)}
                                className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                                  selectedMilk === milk
                                    ? 'bg-primary-tea text-cream border-primary-tea'
                                    : 'border-secondary-tea text-dark-tea hover:border-primary-tea'
                                }`}
                              >
                                {milk === 'regular' ? 'Regular Milk' : milk}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-dark-tea mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full border border-secondary-tea flex items-center justify-center hover:bg-secondary-tea/20 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full border border-secondary-tea flex items-center justify-center hover:bg-secondary-tea/20 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-dark-tea mb-2">
                        Dietary Information
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {item.dietary.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-light-tea text-dark-tea text-xs rounded-full border border-secondary-tea/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-cream px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-tea text-base font-medium text-white hover:bg-dark-tea focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-tea sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Add to Cart • ${item.price.toFixed(2)} × {quantity}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-tea shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-tea hover:bg-secondary-tea/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-tea sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;