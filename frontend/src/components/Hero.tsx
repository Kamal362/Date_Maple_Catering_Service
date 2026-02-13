import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

const Hero: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
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
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
              {/* Check if title exists before splitting */}
              {displayContent.title ? (
                displayContent.title.split(' ').map((word, index) => (
                  word === 'Coffees' ? (
                    <span key={index} className="text-gold"> {word}</span>
                  ) : (
                    ` ${word}`
                  )
                ))
              ) : (
                "Experience Authentic <span className='text-gold'>Coffees</span>"
              )}
            </h1>
            <p className="text-xl mb-8 text-light-tea max-w-lg mx-auto md:mx-0">
              {displayContent.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/menu" className="btn-primary inline-block text-center px-8 py-4 text-lg font-semibold rounded-none hover:bg-dark-tea transition duration-300">
                {displayContent.buttonText}
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-accent-tea rounded-full absolute -top-6 -left-6 opacity-20 animate-pulse"></div>
              <div className="w-64 h-64 md:w-80 md:h-80 bg-secondary-tea rounded-full absolute -bottom-6 -right-6 opacity-20 animate-pulse"></div>
              <div className="relative bg-cream rounded-lg w-64 h-64 md:w-80 md:h-80 overflow-hidden border-8 border-light-tea shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
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