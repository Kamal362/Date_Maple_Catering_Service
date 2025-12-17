import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types/menu';

const Menu = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const items = await getMenuItems();
        setMenuItems(items);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items');
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    let result = menuItems;
    
    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(result);
  }, [activeCategory, searchTerm, menuItems]);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'drinks', name: 'Drinks' },
    { id: 'food', name: 'Food' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
          <p className="mt-4 text-dark-tea">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <p className="text-dark-tea mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="relative bg-primary-tea py-16">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4">Our Menu</h1>
          <p className="text-xl text-cream max-w-2xl mx-auto">
            Discover our delicious selection of beverages and food
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full px-4 py-2 pl-10 border border-secondary-tea rounded-full focus:outline-none focus:ring-2 focus:ring-primary-tea"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-secondary-tea" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary-tea text-cream'
                      : 'bg-cream text-dark-tea border border-secondary-tea hover:bg-light-tea'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="card overflow-hidden">
                <div className="relative">
                  {/* Ensure image is a string before using it as src */}
                  <img 
                    src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
                    alt={item.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-cream bg-opacity-90 px-3 py-1 rounded-full">
                    <span className="font-bold text-primary-tea">${item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-heading font-bold text-dark-tea">{item.name}</h3>
                  </div>
                  <p className="text-secondary-tea mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <button 
                      className="btn-primary"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-heading font-bold text-dark-tea mb-2">No items found</h3>
            <p className="text-secondary-tea mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setActiveCategory('all');
                setSearchTerm('');
              }}
              className="btn-primary"
            >
              View All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;