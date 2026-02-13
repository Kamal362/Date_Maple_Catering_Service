import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

const Gallery: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const galleryContent = await getHomePageContentBySection('gallery');
        setContent(galleryContent);
      } catch (error) {
        console.error('Error fetching gallery content:', error);
        // Fallback to default content
        setContent({
          section: 'gallery',
          title: 'Coffee Gallery',
          subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Default content while loading or if there's an error
  const defaultContent = {
    title: 'Coffee Gallery',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
  };

  const displayContent = content || defaultContent;

  const galleryImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1554444379-4ae4cf0491cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      alt: "Coffee 1",
      title: "Coffee 1",
      description: "Lorem ipsum dolor sit amet, consets adipscing elitr, sed diam nonumy eirmod tempo invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero."
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      alt: "Coffee 2",
      title: "Coffee 2",
      description: "Lorem ipsum dolor sit amet, consets adipscing elitr, sed diam nonumy eirmod tempo invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero."
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      alt: "Coffee 3",
      title: "Coffee 3",
      description: "Lorem ipsum dolor sit amet, consets adipscing elitr, sed diam nonumy eirmod tempo invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero."
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      alt: "Coffee 4",
      title: "Coffee 4",
      description: "Lorem ipsum dolor sit amet, consets adipscing elitr, sed diam nonumy eirmod tempo invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero."
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryImages.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:-translate-y-2">
              <div className="h-64 overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-tea to-transparent opacity-0 group-hover:opacity-80 transition duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-cream transform translate-y-full group-hover:translate-y-0 transition duration-300">
                <h3 className="text-lg font-heading font-semibold mb-1">{image.title}</h3>
                <p className="text-sm text-light-tea">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;