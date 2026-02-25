import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';

const Newsletter: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const newsletterContent = await getHomePageContentBySection('newsletter');
        setContent(newsletterContent);
      } catch (error) {
        console.error('Error fetching newsletter content:', error);
        // Fallback to default content
        setContent({
          section: 'newsletter',
          title: 'Subscribe Our Newsletter',
          subtitle: 'To recieve monthly updates'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Default content while loading or if there's an error
  const defaultContent = {
    title: 'Subscribe Our Newsletter',
    subtitle: 'To recieve monthly updates'
  };

  const displayContent = content || defaultContent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing email:', email);
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <section className="section-padding bg-primary-tea text-cream py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{displayContent.title}</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-xl mb-8 text-light-tea">
            {displayContent.subtitle}
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-cream rounded-lg p-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-grow px-6 py-4 rounded-md text-dark-tea focus:outline-none focus:ring-2 focus:ring-accent-tea bg-white"
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap px-8 py-4 rounded-md">
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;