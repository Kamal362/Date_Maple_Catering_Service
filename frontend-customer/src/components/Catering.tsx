import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

const Catering: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const cateringContent = await getHomePageContentBySection('catering');
        setContent(cateringContent);
      } catch (error) {
        console.error('Error fetching catering content:', error);
        // Fallback to default content
        setContent({
          section: 'catering',
          title: 'Catering Services',
          subtitle: 'Elevate your next event with our exceptional catering services. From intimate gatherings to large corporate events, we provide delicious food and professional service that will impress your guests.',
          buttonText: 'Book an Event'
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
    title: 'Catering Services',
    subtitle: 'Elevate your next event with our exceptional catering services. From intimate gatherings to large corporate events, we provide delicious food and professional service that will impress your guests.',
    buttonText: 'Book an Event'
  };

  const displayContent = content || defaultContent;

  const eventTypes = [
    {
      name: "Corporate Events",
      description: "Impress clients and colleagues with our professional catering services.",
      icon: (
        <svg className="w-12 h-12 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      )
    },
    {
      name: "Social Gatherings",
      description: "Make your celebrations memorable with our delicious catering options.",
      icon: (
        <svg className="w-12 h-12 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      )
    },
    {
      name: "Special Occasions",
      description: "Celebrate life's milestones with our custom catering solutions.",
      icon: (
        <svg className="w-12 h-12 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">{displayContent.title}</h2>
            <p className="text-lg text-dark-tea mb-8">
              {displayContent.subtitle}
            </p>
            
            <div className="space-y-6 mb-8">
              {eventTypes.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 mt-1">
                    {event.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">{event.name}</h3>
                    <p className="text-dark-tea">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/events" className="btn-primary inline-block">
              {displayContent.buttonText}
            </Link>
          </div>
          
          <div className="relative">
            <div className="bg-secondary-tea rounded-lg shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                alt="Catering Service" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary-tea text-cream p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-heading font-bold">Custom Menus</h3>
              <p className="mt-2">Tailored to your event</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catering;