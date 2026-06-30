import React, { useState, useEffect } from 'react';
import { getHomePageContentBySection, HomePageContent } from '../services/homeContentService';
import { useTheme } from '../context/ThemeContext';

const Newsletter: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
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
    title: 'Subscribe Our Newsletter',
    subtitle: 'To recieve monthly updates'
  };

  const displayContent = content || defaultContent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
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
          
          {subscribed ? (
            <div className={`max-w-xl mx-auto border rounded-lg p-4 flex items-center justify-center gap-3 animate-scale-in ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-300'}`}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-800'}`}>Thank you for subscribing to our newsletter!</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;