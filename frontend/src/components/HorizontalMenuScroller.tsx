import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../types/menu';
import { useCart } from '../context/CartContext';

interface HorizontalMenuScrollerProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  title?: string;
}

const HorizontalMenuScroller: React.FC<HorizontalMenuScrollerProps> = ({ 
  items, 
  onAddToCart,
  onViewDetails,
  title = "Our Menu Items"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      if (isMobile) {
        // Vertical scrolling for mobile - scroll to specific item
        const itemHeight = scrollContainerRef.current.children[0]?.clientHeight || 0;
        scrollContainerRef.current.scrollTo({
          top: index * itemHeight,
          behavior: 'smooth'
        });
      } else {
        // Horizontal scrolling for desktop - scroll by viewport width
        const scrollAmount = scrollContainerRef.current.clientWidth;
        scrollContainerRef.current.scrollTo({
          left: index * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (isMobile) {
      // Mobile: scroll one item at a time
      const newIndex = Math.min(currentIndex + 1, items.length - 1);
      scrollToIndex(newIndex);
    } else {
      // Desktop: scroll one page (4 items) at a time
      const maxIndex = Math.max(0, Math.ceil(items.length / 4) - 1);
      const newIndex = Math.min(currentIndex + 1, maxIndex);
      scrollToIndex(newIndex);
    }
  };

  const prevSlide = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const canGoNext = isMobile 
    ? currentIndex < items.length - 1 
    : currentIndex < Math.ceil(items.length / 4) - 1;
  const canGoPrev = currentIndex > 0;

  if (items.length === 0) return null;

  return (
    <div className="relative py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-bold text-dark-tea">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={!canGoPrev}
            className={`p-2 rounded-full border-2 transition-all duration-300 ${
              canGoPrev 
                ? 'border-primary-tea text-primary-tea hover:bg-primary-tea hover:text-cream' 
                : 'border-secondary-tea text-secondary-tea cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={!canGoNext}
            className={`p-2 rounded-full border-2 transition-all duration-300 ${
              canGoNext 
                ? 'border-primary-tea text-primary-tea hover:bg-primary-tea hover:text-cream' 
                : 'border-secondary-tea text-secondary-tea cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ 
          length: isMobile ? items.length : Math.ceil(items.length / 4) 
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary-tea scale-125' 
                : 'bg-secondary-tea/50 hover:bg-secondary-tea'
            }`}
          />
        ))}
      </div>

      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className={`relative overflow-hidden no-scrollbar ${
          isMobile ? 'overflow-y-auto' : 'overflow-x-hidden'
        }`}
        style={{
          height: isMobile ? 'auto' : 'auto',
          maxHeight: isMobile ? 'calc(100vh - 200px)' : 'none'
        }}
      >
        {isMobile ? (
          // Mobile: Vertical layout with one item per scroll
          <div className="space-y-6">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1 border border-secondary-tea/20"
              >
                {/* Image Container with Overlay */}
                <div className="relative overflow-hidden h-64">
                  <img 
                    src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Price Badge with Animation */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-tea to-accent-tea text-cream px-4 py-2 rounded-full font-bold shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <span className="text-lg">${item.price.toFixed(2)}</span>
                  </div>
                  
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button 
                      className="w-full bg-cream text-dark-tea py-3 px-4 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary-tea hover:text-cream"
                      onClick={() => onAddToCart(item)}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 bg-gradient-to-b from-white to-cream/30 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-heading font-bold text-dark-tea group-hover:text-primary-tea transition-colors duration-300">
                      {item.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-secondary-tea/20 text-secondary-tea text-xs font-medium rounded-full capitalize whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-secondary-tea mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Dietary Tags */}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.dietary.slice(0, 3).map((tag: string) => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-light-tea text-dark-tea text-xs rounded-full border border-secondary-tea/30"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.dietary.length > 3 && (
                        <span className="px-2 py-1 bg-light-tea text-dark-tea text-xs rounded-full border border-secondary-tea/30">
                          +{item.dietary.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 bg-primary-tea hover:bg-dark-tea text-cream py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      onClick={() => onViewDetails(item)}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View Details
                      </span>
                    </button>
                    
                    <button 
                      className="p-3 border-2 border-secondary-tea text-secondary-tea hover:border-primary-tea hover:text-primary-tea rounded-lg transition-all duration-300 transform hover:scale-110"
                      onClick={() => onAddToCart(item)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Floating Animation Element */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-tea rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Horizontal layout with 4 items per scroll
          <div className="flex transition-transform duration-500 ease-in-out">
            {Array.from({ length: Math.ceil(items.length / 4) }).map((_, pageIndex) => (
              <div key={pageIndex} className="flex-shrink-0 w-full flex gap-6">
                {items.slice(pageIndex * 4, (pageIndex + 1) * 4).map((item, itemIndex) => (
                  <div 
                    key={item.id} 
                    className="flex-shrink-0 w-1/4 group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-secondary-tea/20"
                  >
                    {/* Image Container with Overlay */}
                    <div className="relative overflow-hidden h-48">
                      <img 
                        src={typeof item.image === 'string' ? item.image : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Price Badge with Animation */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-tea to-accent-tea text-cream px-4 py-2 rounded-full font-bold shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                        <span className="text-lg">${item.price.toFixed(2)}</span>
                      </div>
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <button 
                          className="w-full bg-cream text-dark-tea py-2 px-4 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary-tea hover:text-cream"
                          onClick={() => onAddToCart(item)}
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 bg-gradient-to-b from-white to-cream/30 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-heading font-bold text-dark-tea group-hover:text-primary-tea transition-colors duration-300 line-clamp-2">
                          {item.name}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-secondary-tea/20 text-secondary-tea text-xs font-medium rounded-full capitalize whitespace-nowrap">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-secondary-tea mb-4 leading-relaxed line-clamp-3 flex-grow">
                        {item.description}
                      </p>
                      
                      {/* Dietary Tags */}
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.dietary.slice(0, 2).map((tag: string) => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 bg-light-tea text-dark-tea text-xs rounded-full border border-secondary-tea/30"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.dietary.length > 2 && (
                            <span className="px-2 py-1 bg-light-tea text-dark-tea text-xs rounded-full border border-secondary-tea/30">
                              +{item.dietary.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button 
                          className="flex-1 bg-primary-tea hover:bg-dark-tea text-cream py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                          onClick={() => onViewDetails(item)}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            View Details
                          </span>
                        </button>
                        
                        <button 
                          className="p-3 border-2 border-secondary-tea text-secondary-tea hover:border-primary-tea hover:text-primary-tea rounded-lg transition-all duration-300 transform hover:scale-110"
                          onClick={() => onAddToCart(item)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Floating Animation Element */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-tea rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>
                  </div>
                ))}
                
                {/* Fill remaining slots with empty divs if needed */}
                {Array.from({ length: 4 - items.slice(pageIndex * 4, (pageIndex + 1) * 4).length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="w-1/4"></div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item counter */}
      <div className="text-center mt-4 text-secondary-tea">
        {isMobile 
          ? `${currentIndex + 1} of ${items.length} items` 
          : `${currentIndex + 1} of ${Math.ceil(items.length / 4)} pages`
        }
      </div>
    </div>
  );
};

export default HorizontalMenuScroller;