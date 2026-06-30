import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getMenuItems } from '../services/menuService';
import { MenuItem } from '../types/menu';
import MenuItemDetail from '../components/MenuItemDetail';
import FeaturedItems from '../components/FeaturedItems';
import HorizontalMenuScroller from '../components/HorizontalMenuScroller';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';

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
    { id: 'all', name: 'All Items', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'drinks', name: 'Drinks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'food', name: 'Food', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-tea border-t-transparent mx-auto"></div>
          <p className="mt-4 text-dark-tea dark:text-gray-300 font-body">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-2">Error Loading Menu</div>
          <p className="text-secondary-tea dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <PageHero 
        title="Our Menu" 
        subtitle="Discover our delicious selection of beverages and food"
        height="sm"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filters */}
        <ScrollReveal direction="up">
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              {/* Search Input */}
              <div className="relative flex-grow max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  className="w-full px-5 py-3 pl-12 border border-secondary-tea rounded-full focus:outline-none focus:ring-2 focus:ring-primary-tea focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg 
                  className="absolute left-4 top-3.5 h-5 w-5 text-secondary-tea dark:text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-primary-tea text-cream shadow-lg shadow-primary-tea/20'
                        : 'bg-white dark:bg-gray-800 text-dark-tea dark:text-gray-300 border border-secondary-tea dark:border-gray-600 hover:bg-light-tea dark:hover:bg-gray-700 hover:border-primary-tea'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={category.icon}></path>
                    </svg>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Results count */}
            <p className="text-sm text-secondary-tea dark:text-gray-400">
              Showing <span className="font-semibold text-dark-tea dark:text-gray-200">{filteredItems.length}</span> items
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-10 sm:space-y-12">
          {/* Featured Items Section */}
          <ScrollReveal direction="up" delay={100}>
            <FeaturedItems 
              items={menuItems} 
              onAddToCart={handleQuickAdd}
              onViewDetails={handleViewDetails}
            />
          </ScrollReveal>
          
          {/* Menu Items with Horizontal Scrolling */}
          <ScrollReveal direction="up" delay={200}>
            {filteredItems.length > 0 ? (
              <HorizontalMenuScroller
                items={filteredItems}
                onAddToCart={handleQuickAdd}
                onViewDetails={handleViewDetails}
                title="Browse Our Menu"
              />
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-soft">
                <svg className="w-16 h-16 mx-auto mb-4 text-secondary-tea dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-2">No items found</h3>
                <p className="text-secondary-tea dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
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
          </ScrollReveal>
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
