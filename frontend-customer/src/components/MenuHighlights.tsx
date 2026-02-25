import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';
import { MenuItem } from '../types/menu';
import { getMenuItems } from '../services/menuService';

const MenuHighlights: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch homepage content
        const menuHighlightsContent = await getHomePageContentBySection('menuHighlights');
        setContent(menuHighlightsContent);
        
        // Fetch actual menu items
        const items = await getMenuItems();
        setMenuItems(items.slice(0, 4)); // Take first 4 items
      } catch (error) {
        console.error('Error fetching menu highlights content:', error);
        // Fallback to default content only
        setContent({
          section: 'menuHighlights',
          title: 'Check Out Our Signature Menu',
          subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,',
          buttonText: 'View Menu'
        });
        
        // Don't use hardcoded fallback items - let it show empty state
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Re-fetch when window regains focus (in case content was updated)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Default content while loading or if there's an error
  const defaultContent = {
    title: 'Check Out Our Signature Menu',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,',
    buttonText: 'View Menu'
  };

  const displayContent = content || defaultContent;

  return (
    <section className="section-padding bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-tea">{displayContent.title}</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-lg text-dark-tea max-w-2xl mx-auto">
            {displayContent.subtitle}
          </p>
          <Link to="/menu" className="btn-primary inline-block mt-8 px-8 py-3 text-lg font-semibold rounded-none hover:bg-dark-tea transition duration-300">
            {displayContent.buttonText}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item, index) => (
            <div key={item.id || index} className="group relative overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:-translate-y-2">
              <div className="h-64 overflow-hidden">
                {/* Ensure image is a string before using it as src */}
                <img 
                  src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-tea to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-semibold">{item.name}</h3>
                  <span className="text-lg font-bold text-gold">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-light-tea mb-4">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuHighlights;