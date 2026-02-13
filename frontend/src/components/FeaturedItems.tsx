import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types/menu';

interface FeaturedItemsProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
}

const FeaturedItems: React.FC<FeaturedItemsProps> = ({ 
  items, 
  onAddToCart,
  onViewDetails
}) => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Select 3 random items to feature
  useEffect(() => {
    if (items.length > 0) {
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      setFeaturedItems(shuffled.slice(0, 3));
    }
  }, [items]);

  // Rotate featured items every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredItems.length]);

  if (featuredItems.length === 0) return null;

  const currentItem = featuredItems[currentIndex];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-bold text-dark-tea mb-2">
          Featured Items
        </h2>
        <p className="text-secondary-tea">
          Discover our chef's recommendations
        </p>
      </div>

      <div className="relative bg-gradient-to-r from-primary-tea/10 to-accent-tea/10 rounded-3xl p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary-tea rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent-tea rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-tea to-accent-tea rounded-2xl blur opacity-20"></div>
                <img
                  src={typeof currentItem.image === 'string' ? currentItem.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'}
                  alt={currentItem.name}
                  className="relative w-64 h-64 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
                {/* Animated Fire Flame Badge */}
                <div className="absolute -top-3 -right-3 w-16 h-16 flex items-center justify-center">
                  <div className="relative w-12 h-12">
                    {/* Fire SVG with animation */}
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-full h-full drop-shadow-lg"
                    >
                      {/* Fire layers for animation */}
                      <path 
                        d="M12 2C10.5 2 9 3 8.5 4.5C8 6 8.5 7.5 9.5 8.5C10.5 9.5 12 10 13.5 9.5C15 9 16 7.5 15.5 6C15 4.5 13.5 3 12 2Z" 
                        className="fill-orange-500 animate-fire-flicker"
                        style={{animationDelay: '0ms'}}
                      />
                      <path 
                        d="M12 4C11 4 10 5 9.5 6.5C9 8 9.5 9.5 10.5 10.5C11.5 11.5 13 12 14.5 11.5C16 11 17 9.5 16.5 8C16 6.5 15 5 14 4C13 3 12.5 3.5 12 4Z" 
                        className="fill-red-500 animate-fire-flicker"
                        style={{animationDelay: '200ms'}}
                      />
                      <path 
                        d="M12 6C11.5 6 11 7 10.5 8.5C10 10 10.5 11.5 11.5 12.5C12.5 13.5 14 14 15.5 13.5C17 13 18 11.5 17.5 10C17 8.5 16.5 7.5 16 7C15.5 6.5 14.5 6.5 14 7C13.5 7.5 13 8 12.5 8.5C12 9 11.5 8 11 7.5C10.5 7 11 6.5 11.5 6C12 5.5 12.5 5.5 13 6C13.5 6.5 14 7 14.5 7.5C15 8 15.5 8.5 16 9C16.5 9.5 17 10 17.5 10.5C18 11 18.5 11.5 19 12C19.5 12.5 20 13 20.5 13.5C21 14 21.5 14.5 22 15" 
                        className="fill-yellow-400 animate-fire-flicker"
                        style={{animationDelay: '400ms'}}
                      />
                    </svg>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block px-3 py-1 bg-cream rounded-full text-primary-tea text-sm font-medium mb-4 border border-primary-tea/30">
                Chef's Pick
              </div>
              
              <h3 className="text-3xl font-heading font-bold text-dark-tea mb-3">
                {currentItem.name}
              </h3>
              
              <p className="text-secondary-tea mb-6 leading-relaxed max-w-md">
                {currentItem.description}
              </p>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                {currentItem.dietary && currentItem.dietary.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-cream text-dark-tea text-xs rounded-full border border-secondary-tea/30"
                  >
                    {tag}
                  </span>
                ))}
                {currentItem.dietary && currentItem.dietary.length > 2 && (
                  <span className="px-3 py-1 bg-cream text-dark-tea text-xs rounded-full border border-secondary-tea/30">
                    +{currentItem.dietary.length - 2} more
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => onViewDetails(currentItem)}
                  className="px-6 py-3 bg-primary-tea hover:bg-dark-tea text-cream rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => onAddToCart(currentItem)}
                  className="px-6 py-3 border-2 border-primary-tea text-primary-tea hover:bg-primary-tea hover:text-cream rounded-lg font-medium transition-all duration-300"
                >
                  Quick Add • ${currentItem.price.toFixed(2)}
                </button>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center lg:justify-start mt-8 space-x-2">
                {featuredItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-primary-tea scale-125'
                        : 'bg-secondary-tea/50 hover:bg-secondary-tea'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedItems;