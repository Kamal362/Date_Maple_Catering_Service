import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

const Testimonials: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const testimonialsContent = await getHomePageContentBySection('testimonials');
        setContent(testimonialsContent);
      } catch (error) {
        console.error('Error fetching testimonials content:', error);
        // Fallback to default content
        setContent({
          section: 'testimonials',
          title: 'Customers Feedback',
          subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
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
    title: 'Customers Feedback',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
  };

  const displayContent = content || defaultContent;

  const testimonials = [
    {
      name: "Justyna Helen",
      role: "Coffee Lover",
      content: "Lorem ipsum dolor sit amdi scing elitr, sed diam nonumy eirmo tem invidunt ut labore etdolo magna aliquyam erat, sed diam voluptua. At vero eos et accusam.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    },
    {
      name: "Fajar Siddiq",
      role: "Coffee Enthusiast",
      content: "Lorem ipsum dolor sit amdi scing elitr, sed diam nonumy eirmo tem invidunt ut labore etdolo magna aliquyam erat, sed diam voluptua. At vero eos et accusam.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    },
    {
      name: "Rob Hope",
      role: "Enthusiasts",
      content: "Lorem ipsum dolor sit amdi scing elitr, sed diam nonumy eirmo tem invidunt ut labore etdolo magna aliquyam erat, sed diam voluptua. At vero eos et accusam.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    }
  ];

  return (
    <section className="section-padding bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-tea">{displayContent.title}</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-lg text-dark-tea max-w-2xl mx-auto">
            {displayContent.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-accent-tea group relative">
              <div className="absolute top-0 left-8 transform -translate-y-1/2 bg-cream px-4 py-2 rounded-lg border border-light-tea">
                <svg className="w-8 h-8 text-accent-tea" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex items-center mb-6 mt-8">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-light-tea"
                />
                <div>
                  <h3 className="text-xl font-heading font-semibold text-primary-tea">{testimonial.name}</h3>
                  <p className="text-secondary-tea">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-dark-tea italic mb-4">"{testimonial.content}"</p>
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;