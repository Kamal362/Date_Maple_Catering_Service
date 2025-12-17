import React, { useState, useEffect } from 'react';
import { HomePageContent, createOrUpdateHomePageContent } from '../services/homeContentService';

interface HomePageContentEditorProps {
  section: string;
  onClose: () => void;
  onSave: () => void;
}

const HomePageContentEditor: React.FC<HomePageContentEditorProps> = ({ section, onClose, onSave }) => {
  const [content, setContent] = useState<HomePageContent>({
    section: section,
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    items: [],
    settings: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing content when component mounts
  useEffect(() => {
    // In a real implementation, we would fetch the existing content for this section
    // For now, we'll initialize with default values
    console.log(`Loading content for section: ${section}`);
  }, [section]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await createOrUpdateHomePageContent(content);
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const sectionTitles: Record<string, string> = {
    hero: 'Hero Section',
    features: 'Features Section',
    menuHighlights: 'Menu Highlights',
    gallery: 'Gallery Section',
    catering: 'Catering Section',
    testimonials: 'Testimonials',
    newsletter: 'Newsletter'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading font-semibold text-primary-tea">
              Edit {sectionTitles[section] || section}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-dark-tea text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={content.title || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder="Enter section title"
              />
            </div>
            
            <div>
              <label className="block text-dark-tea text-sm font-medium mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={content.subtitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder="Enter section subtitle"
              />
            </div>
            
            <div>
              <label className="block text-dark-tea text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={content.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                placeholder="Enter section description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={content.buttonText || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  placeholder="Enter button text"
                />
              </div>
              
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">
                  Button Link
                </label>
                <input
                  type="text"
                  name="buttonLink"
                  value={content.buttonLink || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  placeholder="Enter button link"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageContentEditor;