import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';
import { useTheme } from '../context/ThemeContext';
import ScrollReveal from './ScrollReveal';

// Extend the HomePageContent items type to include number property
interface FeatureItem {
  name?: string;
  title?: string;
  role?: string;
  description?: string;
  price?: string;
  image?: string;
  alt?: string;
  number?: string; // Add the number property
}

// Extend HomePageContent to include properly typed items
interface FeaturesContent extends HomePageContent {
  items?: FeatureItem[];
}

const Features: React.FC = () => {
  const [content, setContent] = useState<FeaturesContent | null>(null);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const featuresContent = await getHomePageContentBySection('features');
        setContent(featuresContent as FeaturesContent);
      } catch (error) {
        console.error('Error fetching features content:', error);
        // Fallback to default content
        setContent({
          section: 'features',
          title: 'Why Choose Date&Maple?',
          subtitle: 'We are committed to providing an exceptional dining experience with quality, freshness, and passion.',
          items: [
            {
              title: "Premium Ingredients",
              description: "We source only the finest ingredients to ensure exceptional taste in every bite and sip.",
              number: "01"
            },
            {
              title: "Fresh Daily",
              description: "Our menu items are prepared fresh daily to guarantee the highest quality and taste.",
              number: "02"
            },
            {
              title: "Expert Chefs",
              description: "Our team of skilled chefs brings creativity and expertise to every dish they prepare.",
              number: "03"
            }
          ]
        } as FeaturesContent);
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
  const defaultContent: FeaturesContent = {
    section: 'features',
    title: 'Why Choose Date&Maple?',
    subtitle: 'We are committed to providing an exceptional dining experience with quality, freshness, and passion.',
    items: [
      {
        title: "Premium Ingredients",
        description: "We source only the finest ingredients to ensure exceptional taste in every bite and sip.",
        number: "01"
      },
      {
        title: "Fresh Daily",
        description: "Our menu items are prepared fresh daily to guarantee the highest quality and taste.",
        number: "02"
      },
      {
        title: "Expert Chefs",
        description: "Our team of skilled chefs brings creativity and expertise to every dish they prepare.",
        number: "03"
      }
    ]
  };

  const displayContent = content || defaultContent;

  const features = displayContent.items?.map((item, index) => ({
    ...item,
    icon: (
      <svg className="w-16 h-16 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
        {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
      </svg>
    )
  })) || defaultContent.items!.map((item, index) => ({
    ...item,
    icon: (
      <svg className="w-16 h-16 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
        {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
      </svg>
    )
  }));

  return (
    <section className={`section-padding py-12 sm:py-16 md:py-20 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-cream'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="down">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 sm:mb-4 px-4 sm:px-0 ${isDark ? 'text-amber-400' : 'text-primary-tea'}`}>{displayContent.title}</h2>
            <div className="w-16 sm:w-20 h-1 bg-accent-tea mx-auto mb-4 sm:mb-6"></div>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-6 ${isDark ? 'text-gray-300' : 'text-dark-tea'}`}>
              {displayContent.subtitle}
            </p>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 px-4 sm:px-0">
          {features.map((feature, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 100}>
              <div className={`rounded-lg p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-accent-tea group h-full ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full group-hover:bg-accent-tea transition duration-300 ${isDark ? 'bg-gray-700' : 'bg-cream'}`}>
                    {feature.icon}
                  </div>
                  <span className={`text-4xl sm:text-5xl font-heading font-bold ${isDark ? 'text-gray-600' : 'text-light-tea'}`}>{feature.number}</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-heading font-semibold mb-3 sm:mb-4 ${isDark ? 'text-amber-400' : 'text-primary-tea'}`}>{feature.title}</h3>
                <p className={`text-sm sm:text-base mb-4 ${isDark ? 'text-gray-300' : 'text-dark-tea'}`}>{feature.description}</p>
                <button className="text-accent-tea font-medium flex items-center group-hover:text-primary-tea transition duration-300 text-sm sm:text-base">
                  Learn More
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;