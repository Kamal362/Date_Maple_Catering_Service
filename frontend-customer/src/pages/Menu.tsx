import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types/menu';
import MenuItemDetail from '../components/MenuItemDetail';
import FeaturedItems from '../components/FeaturedItems';
import HorizontalMenuScroller from '../components/HorizontalMenuScroller';

const Menu = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch menu items
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

  // Filter items
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

  // Modal handlers
  const handleViewDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddToCartFromDetail = (item: MenuItem) => {
    addToCart(item);
    handleCloseDetail();
  };

  const handleQuickAdd = (item: MenuItem) => {
    addToCart(item);
  };

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

        <div className="space-y-12">
          {/* Featured Items Section */}
          <FeaturedItems 
            items={menuItems} 
            onAddToCart={handleQuickAdd}
            onViewDetails={handleViewDetails}
          />
          
          {/* Menu Items with Horizontal Scrolling */}
          {filteredItems.length > 0 ? (
            <HorizontalMenuScroller
              items={filteredItems}
              onAddToCart={handleQuickAdd}
              onViewDetails={handleViewDetails}
              title="Browse Our Menu"
            />
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

      {/* Detail Modal */}
      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetail}
          onAddToCart={handleAddToCartFromDetail}
        />
      )}
    </div>
  );
};

export default Menu;