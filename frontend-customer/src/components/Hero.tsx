import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

const Hero: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const heroContent = await getHomePageContentBySection('hero');
        setContent(heroContent);
      } catch (error) {
        console.error('Error fetching hero content:', error);
        // Fallback to default content
        setContent({
          section: 'hero',
          title: 'Experience Authentic Coffees',
          subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,',
          buttonText: 'Learn More'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    // Re-fetch when window regains focus (in case content was updated)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchContent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Default content while loading or if there's an error
  const defaultContent = {
    title: 'Experience Authentic Coffees',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,',
    buttonText: 'Learn More'
  };

  const displayContent = content || defaultContent;

  return (
    <section className="relative bg-primary-tea text-cream overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1
      }}></div>
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 leading-tight">
              {displayContent.title ? (
                (() => {
                  // Strip HTML tags and split by 'Coffees' to highlight it
                  const cleanTitle = displayContent.title.replace(/<[^>]*>/g, '');
                  const parts = cleanTitle.split('Coffees');
                  if (parts.length === 2) {
                    return (
                      <>
                        {parts[0]}<span className="text-white">Coffees</span>{parts[1]}
                      </>
                    );
                  }
                  return cleanTitle;
                })()
              ) : (
                <>
                  Experience Authentic <span className="text-white">Coffees</span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-light-tea max-w-lg mx-auto lg:mx-0 px-4 sm:px-0">
              {displayContent.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <Link to="/menu" className="btn-primary inline-block text-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none hover:bg-dark-tea transition duration-300 btn-touch">
                {displayContent.buttonText}
              </Link>
            </div>
          </div>
          <div className="flex justify-center order-1 lg:order-2 mb-8 lg:mb-0">
            <div className="relative">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-accent-tea rounded-full absolute -top-4 -left-4 sm:-top-6 sm:-left-6 opacity-20 animate-pulse"></div>
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-secondary-tea rounded-full absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 opacity-20 animate-pulse"></div>
              <div className="relative bg-cream rounded-lg w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 overflow-hidden border-4 sm:border-8 border-light-tea shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                  alt="Delicious Coffee and Pastry" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;