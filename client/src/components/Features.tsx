import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

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

  useEffect(() => {
    const fetchContent = async () => {
      try {
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
    <section className="section-padding bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-tea">{displayContent.title}</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-lg text-dark-tea max-w-2xl mx-auto">
            {displayContent.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-accent-tea group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-cream rounded-full group-hover:bg-accent-tea transition duration-300">
                  {feature.icon}
                </div>
                <span className="text-5xl font-heading font-bold text-light-tea">{feature.number}</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-primary-tea">{feature.title}</h3>
              <p className="text-dark-tea mb-4">{feature.description}</p>
              <button className="text-accent-tea font-medium flex items-center group-hover:text-primary-tea transition duration-300">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;