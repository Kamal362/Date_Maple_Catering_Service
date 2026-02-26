import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

const Gallery: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
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
    title: 'Coffee Gallery',
    subtitle: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,'
  };

  // Default gallery images as fallback
  const defaultGalleryImages: GalleryItem[] = [
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

  const displayContent = content || defaultContent;

  // Get settings from content or use defaults
  const settings = content?.settings || {};
  const layoutStyle = (settings.layout as string) || 'grid';
  const columns = (settings.columns as number) || 4;
  const enableLightbox = settings.lightbox !== false; // default to true

  // Use gallery items from database or fallback to defaults
  const galleryImages: GalleryItem[] = content?.items && content.items.length > 0 
    ? content.items.map((item: any, index: number) => ({
        id: index + 1,
        src: item.image || item.src || defaultGalleryImages[index]?.src || defaultGalleryImages[0].src,
        alt: item.alt || item.title || `Gallery image ${index + 1}`,
        title: item.title || item.name || `Image ${index + 1}`,
        description: item.description || ''
      }))
    : defaultGalleryImages;

  // Generate grid class based on columns setting
  const getGridClass = () => {
    const baseClass = 'grid gap-6';
    if (layoutStyle === 'masonry') {
      return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`;
    }
    // Grid layout
    switch (columns) {
      case 1: return `${baseClass} grid-cols-1`;
      case 2: return `${baseClass} grid-cols-1 sm:grid-cols-2`;
      case 3: return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      case 4: return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`;
      case 5: return `${baseClass} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`;
      case 6: return `${baseClass} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6`;
      default: return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`;
    }
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

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
        
        <div className={getGridClass()}>
          {galleryImages.map((image, index) => (
            <div 
              key={image.id} 
              className={`group relative overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:-translate-y-2 ${enableLightbox ? 'cursor-pointer' : ''}`}
              onClick={() => openLightbox(index)}
            >
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

        {/* Lightbox Modal */}
        {enableLightbox && lightboxOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={closeLightbox}>
            <div className="relative max-w-5xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
              <button 
                className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
                onClick={closeLightbox}
              >
                ×
              </button>
              <img 
                src={galleryImages[lightboxIndex]?.src} 
                alt={galleryImages[lightboxIndex]?.alt}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <div className="text-center text-white mt-4">
                <h3 className="text-xl font-semibold">{galleryImages[lightboxIndex]?.title}</h3>
                <p className="text-gray-300">{galleryImages[lightboxIndex]?.description}</p>
                <p className="text-sm text-gray-400 mt-2">{lightboxIndex + 1} / {galleryImages.length}</p>
              </div>
              {galleryImages.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
                    onClick={goToPrev}
                  >
                    ‹
                  </button>
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
                    onClick={goToNext}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;