import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createOrUpdateHomePageContent, getHomePageContentBySection } from '../services/homeContentService';
import { HomePageContent } from '../services/homeContentService';
import ConfirmModal from './ConfirmModal';

interface HomePageContentEditorProps {
  section: string;
  onClose: () => void;
  onSave: () => void;
}

// ─── Per-member upload state types ────────────────────────────────────────────
type MemberImageMode = 'url' | 'upload';

const HomePageContentEditor: React.FC<HomePageContentEditorProps> = ({ section, onClose, onSave }) => {
  // Per-member upload state (parallel arrays indexed by member index)
  const [memberImageModes, setMemberImageModes] = useState<MemberImageMode[]>([]);
  const [memberPreviews, setMemberPreviews] = useState<(string | null)[]>([]);
  const [memberUploading, setMemberUploading] = useState<boolean[]>([]);
  const memberFileRefs = useRef<(HTMLInputElement | null)[]>([]);

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing content when component mounts
  useEffect(() => {
    const fetchExistingContent = async () => {
      try {
        setLoading(true);
        const existingContent = await getHomePageContentBySection(section);
        setContent(existingContent);
        // Initialize per-member upload state from loaded items
        if (existingContent.items?.length) {
          const count = existingContent.items.length;
          setMemberImageModes(existingContent.items.map((it) => (it.image ? 'url' : 'url')));
          setMemberPreviews(existingContent.items.map((it) => it.image || null));
          setMemberUploading(Array(count).fill(false));
          memberFileRefs.current = Array(count).fill(null);
        }
      } catch (err) {
        console.log(`No existing content found for section: ${section}, using defaults`);
        // Keep default empty content for new sections
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingContent();
  }, [section]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemsChange = (index: number, field: string, value: string) => {
    const newItems = [...(content.items || [])];
    if (!newItems[index]) {
      newItems[index] = { title: '', description: '' };
    }
    newItems[index] = { ...newItems[index], [field]: value };
    setContent(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    const newItems = [...(content.items || []), { title: '', description: '' }];
    setContent(prev => ({
      ...prev,
      items: newItems
    }));
    // Extend parallel upload state arrays
    setMemberImageModes(prev => [...prev, 'url']);
    setMemberPreviews(prev => [...prev, null]);
    setMemberUploading(prev => [...prev, false]);
    memberFileRefs.current = [...memberFileRefs.current, null];
  };

  // ─── Team member image upload helpers ──────────────────────────────────────
  const setMemberImageMode = useCallback((index: number, mode: MemberImageMode) => {
    setMemberImageModes(prev => {
      const next = [...prev];
      next[index] = mode;
      return next;
    });
  }, []);

  const handleMemberFileChange = useCallback(async (index: number, file: File | null) => {
    if (!file) {
      setMemberPreviews(prev => { const n = [...prev]; n[index] = null; return n; });
      return;
    }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setMemberPreviews(prev => { const n = [...prev]; n[index] = reader.result as string; return n; });
    };
    reader.readAsDataURL(file);

    // Upload to server
    setMemberUploading(prev => { const n = [...prev]; n[index] = true; return n; });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const apiBase = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api`;
      const res = await fetch(`${apiBase}/upload?type=team-member`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        handleItemsChange(index, 'image', data.url);
        setMemberPreviews(prev => { const n = [...prev]; n[index] = data.url; return n; });
      }
    } catch (err) {
      console.error('Team member photo upload failed:', err);
    } finally {
      setMemberUploading(prev => { const n = [...prev]; n[index] = false; return n; });
    }
  }, []);

  const removeItem = (index: number) => {
    const newItems = [...(content.items || [])];
    newItems.splice(index, 1);
    setContent(prev => ({
      ...prev,
      items: newItems
    }));
    // Shrink parallel upload state arrays
    setMemberImageModes(prev => prev.filter((_, i) => i !== index));
    setMemberPreviews(prev => prev.filter((_, i) => i !== index));
    setMemberUploading(prev => prev.filter((_, i) => i !== index));
    memberFileRefs.current = memberFileRefs.current.filter((_, i) => i !== index);
  };

  const handleSettingsChange = (key: string, value: string | number | boolean) => {
    setContent(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await createOrUpdateHomePageContent(content);
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving content:', err);
      setError('Failed to save content: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Individual section save functions
  const saveSection = async (sectionName: string, sectionData: Partial<HomePageContent>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedContent = { ...content, ...sectionData, section };
      await createOrUpdateHomePageContent(updatedContent);
      // Update local state
      setContent(updatedContent);
      // Show success feedback
      setSuccessMessage(`${sectionName} has been saved successfully!`);
      setShowSuccessModal(true);
      return true;
    } catch (err: any) {
      console.error(`Error saving ${sectionName}:`, err);
      setError(`Failed to save ${sectionName}: ` + (err.response?.data?.message || err.message || 'Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveBasicInfo = async () => {
    const sectionData = {
      title: content.title,
      subtitle: content.subtitle,
      description: content.description
    };
    return await saveSection('Basic Information', sectionData);
  };

  const saveSocialMedia = async () => {
    const sectionData = {
      settings: content.settings
    };
    return await saveSection('Social Media Links', sectionData);
  };

  const saveContactInfo = async () => {
    const sectionData = {
      settings: content.settings
    };
    return await saveSection('Contact Information', sectionData);
  };

  const saveQuickLinks = async () => {
    const sectionData = {
      items: content.items
    };
    return await saveSection('Quick Links', sectionData);
  };

  const saveOpeningHours = async () => {
    const sectionData = {
      items: content.items
    };
    return await saveSection('Opening Hours', sectionData);
  };

  // Section-specific renderers
  const renderHeroEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Main Heading</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-lg font-semibold"
            placeholder="Welcome to Date & Maple"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subheading</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Premium Coffee & Tea Experience"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Hero Description</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="Discover our handcrafted beverages made with premium ingredients and served in a cozy atmosphere perfect for relaxation and socializing."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Primary Button Text</label>
          <input
            type="text"
            name="buttonText"
            value={content.buttonText || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Order Online Now"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Button Link</label>
          <input
            type="text"
            name="buttonLink"
            value={content.buttonLink || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="/menu"
          />
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Visual Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Background Image URL</label>
            <input
              type="text"
              value={(content.settings?.backgroundImage as string) || ''}
              onChange={(e) => handleSettingsChange('backgroundImage', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="https://example.com/hero-image.jpg"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Overlay Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={(content.settings?.overlayOpacity as number)?.toString() || '0.5'}
              onChange={(e) => handleSettingsChange('overlayOpacity', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-secondary-tea">{(content.settings?.overlayOpacity as number || 0.5).toFixed(1)}</span>
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Text Alignment</label>
            <select
              value={(content.settings?.textAlign as string) || 'center'}
              onChange={(e) => handleSettingsChange('textAlign', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Why Choose Us"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Experience excellence in every cup"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Section Description</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="We pride ourselves on quality service and exceptional products that make every visit memorable."
        />
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Features List</h4>
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            Add Feature
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(content.items || []).map((item, index) => (
            <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-dark-tea">Feature {index + 1}</h5>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Feature Title</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => handleItemsChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Premium Quality Ingredients"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Icon Class</label>
                  <input
                    type="text"
                    value={item.icon || ''}
                    onChange={(e) => handleItemsChange(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="fas fa-seedling"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Feature Description</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="We source only the finest organic ingredients from local suppliers to ensure the highest quality in every beverage."
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(content.items || []).length === 0 && (
            <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
              <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p className="font-medium">No features added yet</p>
              <p className="text-sm mt-1">Click "Add Feature" to get started</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Display Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Columns Layout</label>
            <select
              value={(content.settings?.columns as number)?.toString() || '3'}
              onChange={(e) => handleSettingsChange('columns', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            >
              <option value="1">Single Column</option>
              <option value="2">Two Columns</option>
              <option value="3">Three Columns</option>
              <option value="4">Four Columns</option>
            </select>
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Icon Style</label>
            <select
              value={(content.settings?.iconStyle as string) || 'circle'}
              onChange={(e) => handleSettingsChange('iconStyle', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            >
              <option value="circle">Circular Icons</option>
              <option value="square">Square Icons</option>
              <option value="none">No Icons</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMenuHighlightsEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Featured Menu Items"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Our most popular selections"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="Discover our signature drinks and seasonal specialties that our customers love the most."
        />
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Highlighted Items</h4>
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            Add Menu Item
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(content.items || []).map((item, index) => (
            <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-dark-tea">Menu Item {index + 1}</h5>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Item Name</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => handleItemsChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Caramel Macchiato"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Price</label>
                  <input
                    type="text"
                    value={item.price || ''}
                    onChange={(e) => handleItemsChange(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="$4.99"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Image URL</label>
                  <input
                    type="text"
                    value={item.image || ''}
                    onChange={(e) => handleItemsChange(index, 'image', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="https://example.com/item-image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={item.alt || ''}
                    onChange={(e) => handleItemsChange(index, 'alt', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Delicious caramel macchiato"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Description</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Rich espresso blended with steamed milk and topped with caramel drizzle."
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(content.items || []).length === 0 && (
            <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
              <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p className="font-medium">No menu items added yet</p>
              <p className="text-sm mt-1">Click "Add Menu Item" to showcase your featured products</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Display Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Max Items Display</label>
            <input
              type="number"
              min="1"
              max="20"
              value={(content.settings?.maxItems as number)?.toString() || '6'}
              onChange={(e) => handleSettingsChange('maxItems', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            />
          </div>
          
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="showPrices"
              checked={(content.settings?.showPrices as boolean) || true}
              onChange={(e) => handleSettingsChange('showPrices', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="showPrices" className="ml-2 text-sm text-dark-tea">Show Prices</label>
          </div>
          
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="showImages"
              checked={(content.settings?.showImages as boolean) || true}
              onChange={(e) => handleSettingsChange('showImages', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="showImages" className="ml-2 text-sm text-dark-tea">Show Images</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGalleryEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Gallery Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Our Coffee Moments"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Beautiful moments captured in our café"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="Browse through our collection of photos showcasing our cozy atmosphere, delicious creations, and happy customers enjoying their favorite beverages."
        />
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Gallery Images</h4>
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            Add Image
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(content.items || []).map((item, index) => (
            <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-dark-tea">Image {index + 1}</h5>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Image URL</label>
                  <input
                    type="text"
                    value={item.image || ''}
                    onChange={(e) => handleItemsChange(index, 'image', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="https://example.com/gallery/image1.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={item.alt || ''}
                    onChange={(e) => handleItemsChange(index, 'alt', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Cozy café interior with warm lighting"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Caption/Description</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Our signature latte art created by our skilled baristas"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(content.items || []).length === 0 && (
            <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
              <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="font-medium">No images added yet</p>
              <p className="text-sm mt-1">Click "Add Image" to build your gallery</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Gallery Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Layout Style</label>
            <select
              value={(content.settings?.layout as string) || 'grid'}
              onChange={(e) => handleSettingsChange('layout', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            >
              <option value="grid">Grid Layout</option>
              <option value="carousel">Carousel Slider</option>
              <option value="masonry">Masonry Grid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Columns</label>
            <select
              value={(content.settings?.columns as number)?.toString() || '3'}
              onChange={(e) => handleSettingsChange('columns', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            >
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={num.toString()}>{num} Column{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="lightbox"
              checked={(content.settings?.lightbox as boolean) || true}
              onChange={(e) => handleSettingsChange('lightbox', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="lightbox" className="ml-2 text-sm text-dark-tea">Enable Lightbox</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCateringEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Professional Catering Services"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Bring our expertise to your special events"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="From corporate meetings to private celebrations, our professional catering team delivers exceptional coffee and tea service tailored to your event's needs. We provide everything from beverage stations to full-service catering with customizable menus."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Call-to-Action Button</label>
          <input
            type="text"
            name="buttonText"
            value={content.buttonText || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Request a Quote"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Button Link</label>
          <input
            type="text"
            name="buttonLink"
            value={content.buttonLink || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="/catering"
          />
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Catering Services</h4>
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            Add Service
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(content.items || []).map((item, index) => (
            <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-dark-tea">Service {index + 1}</h5>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Service Name</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => handleItemsChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Full Service Catering"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Starting Price</label>
                  <input
                    type="text"
                    value={item.price || ''}
                    onChange={(e) => handleItemsChange(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="From $25 per person"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Service Description</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Complete beverage service including setup, staffing, equipment, and cleanup for your event."
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(content.items || []).length === 0 && (
            <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
              <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p className="font-medium">No services added yet</p>
              <p className="text-sm mt-1">Click "Add Service" to showcase your catering offerings</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Catering Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPricing"
              checked={(content.settings?.showPricing as boolean) || true}
              onChange={(e) => handleSettingsChange('showPricing', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="showPricing" className="ml-2 text-sm text-dark-tea">Show Pricing Table</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="contactForm"
              checked={(content.settings?.contactForm as boolean) || true}
              onChange={(e) => handleSettingsChange('contactForm', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="contactForm" className="ml-2 text-sm text-dark-tea">Show Contact Form</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestimonialsEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="What Our Customers Say"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Real reviews from satisfied customers"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Introduction</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="Hear from our valued customers about their experiences with our coffee, service, and atmosphere."
        />
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Customer Testimonials</h4>
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            Add Testimonial
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {(content.items || []).map((item, index) => (
            <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-dark-tea">Testimonial {index + 1}</h5>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => handleItemsChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Sarah Johnson"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Role/Location</label>
                  <input
                    type="text"
                    value={item.role || ''}
                    onChange={(e) => handleItemsChange(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="Regular Customer"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Review Text</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="The best coffee in town! Their lattes are perfectly balanced and the atmosphere is so welcoming. I come here every morning before work and always leave feeling energized and happy."
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(content.items || []).length === 0 && (
            <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
              <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="font-medium">No testimonials added yet</p>
              <p className="text-sm mt-1">Click "Add Testimonial" to share customer feedback</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Display Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoplay"
              checked={(content.settings?.autoplay as boolean) || true}
              onChange={(e) => handleSettingsChange('autoplay', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="autoplay" className="ml-2 text-sm text-dark-tea">Autoplay Slideshow</label>
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Slide Interval (sec)</label>
            <input
              type="number"
              min="2"
              max="30"
              value={(content.settings?.interval as number)?.toString() || '5'}
              onChange={(e) => handleSettingsChange('interval', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showRating"
              checked={(content.settings?.showRating as boolean) || true}
              onChange={(e) => handleSettingsChange('showRating', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="showRating" className="ml-2 text-sm text-dark-tea">Show Star Ratings</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsletterEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Stay Connected"
          />
        </div>
        
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Join our mailing list for exclusive offers and updates"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="Be the first to know about new menu items, special promotions, upcoming events, and coffee brewing tips from our experts."
        />
      </div>
      
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Subscribe Button Text</label>
        <input
          type="text"
          name="buttonText"
          value={content.buttonText || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          placeholder="Subscribe Now"
        />
      </div>
      
      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-lg font-heading font-semibold text-dark-tea mb-4">Newsletter Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Email Placeholder</label>
            <input
              type="text"
              value={(content.settings?.placeholder as string) || 'Enter your email address'}
              onChange={(e) => handleSettingsChange('placeholder', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Success Message</label>
            <input
              type="text"
              value={(content.settings?.successMessage as string) || 'Thank you for subscribing!'}
              onChange={(e) => handleSettingsChange('successMessage', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            />
          </div>
          
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="showNameField"
              checked={(content.settings?.showNameField as boolean) || false}
              onChange={(e) => handleSettingsChange('showNameField', e.target.checked)}
              className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
            />
            <label htmlFor="showNameField" className="ml-2 text-sm text-dark-tea">Show Name Field</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFooterEditor = () => (
    <div className="space-y-6">
      <div className="border border-secondary-tea rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Basic Information</h4>
          <button
            type="button"
            onClick={saveBasicInfo}
            className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors text-sm"
          >
            Save Section
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              name="title"
              value={content.title || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="Date&Maple"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Copyright Text</label>
            <input
              type="text"
              name="subtitle"
              value={content.subtitle || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="All rights reserved. Designed and Developed by UIdeck"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-dark-tea text-sm font-medium mb-2">Company Description</label>
          <textarea
            name="description"
            value={content.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Crafting exceptional culinary experiences with passion and precision."
          />
        </div>
      </div>
      
      <div className="border border-secondary-tea rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Social Media Links</h4>
          <button
            type="button"
            onClick={saveSocialMedia}
            className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors text-sm"
          >
            Save Section
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Facebook URL</label>
            <input
              type="text"
              value={(content.settings?.facebookUrl as string) || ''}
              onChange={(e) => handleSettingsChange('facebookUrl', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="https://facebook.com/datemaple"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Instagram URL</label>
            <input
              type="text"
              value={(content.settings?.instagramUrl as string) || ''}
              onChange={(e) => handleSettingsChange('instagramUrl', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="https://instagram.com/datemaple"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Twitter URL</label>
            <input
              type="text"
              value={(content.settings?.twitterUrl as string) || ''}
              onChange={(e) => handleSettingsChange('twitterUrl', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="https://twitter.com/datemaple"
            />
          </div>
        </div>
      </div>
      
      <div className="border border-secondary-tea rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Contact Information</h4>
          <button
            type="button"
            onClick={saveContactInfo}
            className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors text-sm"
          >
            Save Section
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={(content.settings?.address as string) || ''}
              onChange={(e) => handleSettingsChange('address', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="123 Coffee Street, Tea City"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Phone Number</label>
            <input
              type="text"
              value={(content.settings?.phone as string) || ''}
              onChange={(e) => handleSettingsChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="(123) 456-7890"
            />
          </div>
          
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={(content.settings?.email as string) || ''}
              onChange={(e) => handleSettingsChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="info@datemaple.com"
            />
          </div>
        </div>
      </div>
      
      <div className="border border-secondary-tea rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Quick Links</h4>
          <button
            type="button"
            onClick={saveQuickLinks}
            className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors text-sm"
          >
            Save Section
          </button>
        </div>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {(content.items || []).filter(item => item.role !== 'hours').map((item, index) => {
            // Calculate the actual index in the original array
            const actualIndex = (content.items || []).findIndex((origItem, origIndex) => 
              origItem === item
            );
            
            return (
              <div key={actualIndex} className="border border-secondary-tea rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-secondary-tea mb-1">Link Text</label>
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => handleItemsChange(actualIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                      placeholder="Home"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-secondary-tea mb-1">Link URL</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleItemsChange(actualIndex, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                      placeholder="/"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(actualIndex)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Link
                  </button>
                </div>
              </div>
            );
          })}
          
          <button
            type="button"
            onClick={() => {
              const newItems = [...(content.items || []), { name: '', title: '', role: 'link' }];
              setContent(prev => ({ ...prev, items: newItems }));
            }}
            className="w-full py-3 border-2 border-dashed border-secondary-tea rounded-lg text-secondary-tea hover:border-primary-tea hover:text-primary-tea transition-colors"
          >
            + Add Quick Link
          </button>
        </div>
      </div>
      
      <div className="border border-secondary-tea rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Opening Hours</h4>
          <button
            type="button"
            onClick={saveOpeningHours}
            className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors text-sm"
          >
            Save Section
          </button>
        </div>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {(content.items || []).filter(item => item.role === 'hours').map((item, index) => {
            // Get the actual index in the items array
            const hoursItems = (content.items || []).filter(i => i.role === 'hours');
            const actualIndex = (content.items || []).findIndex(i => i === item);
            
            return (
              <div key={`hours-${index}`} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium text-dark-tea">Hours Entry {index + 1}</h5>
                  <button
                    onClick={() => {
                      const newItems = [...(content.items || [])];
                      newItems.splice(actualIndex, 1);
                      setContent(prev => ({ ...prev, items: newItems }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-secondary-tea mb-1">Day(s)</label>
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => {
                        const newItems = [...(content.items || [])];
                        newItems[actualIndex] = { ...newItems[actualIndex], name: e.target.value };
                        setContent(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                      placeholder="Monday"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-secondary-tea mb-1">Hours</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...(content.items || [])];
                        newItems[actualIndex] = { ...newItems[actualIndex], title: e.target.value };
                        setContent(prev => ({ ...prev, items: newItems }));
                      }}
                      className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                      placeholder="7:00 AM - 8:00 PM"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Always show Add button */}
          <button
            type="button"
            onClick={() => {
              const newItems = [...(content.items || []), { name: '', title: '', role: 'hours' }];
              setContent(prev => ({ ...prev, items: newItems }));
            }}
            className="w-full py-3 border-2 border-dashed border-secondary-tea rounded-lg text-secondary-tea hover:border-primary-tea hover:text-primary-tea transition-colors"
          >
            + Add Opening Hours
          </button>
        </div>
      </div>
    </div>
  );

  // Section configuration mapping
  const renderAboutStoryEditor = () => (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Page Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Our Story"
          />
        </div>
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Page Tagline</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Lorem ipsum dolor sit amet…"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">About Section Heading</label>
          <input
            type="text"
            name="buttonText"
            value={content.buttonText || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="About Coffee Shop"
          />
        </div>
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Side Image URL</label>
          <input
            type="text"
            name="buttonLink"
            value={content.buttonLink || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="https://example.com/about-photo.jpg"
          />
        </div>
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">About Paragraph 1</label>
        <textarea
          name="description"
          value={content.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea resize-none"
          placeholder="Tell your story… (first paragraph)"
        />
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">About Paragraph 2</label>
        <textarea
          name="settings.paragraph2" 
          value={(content.settings?.paragraph2 as string) || ''}
          onChange={(e) => handleSettingsChange('paragraph2', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea resize-none"
          placeholder="Continuation of your story… (second paragraph)"
        />
      </div>

      <div className="border-t border-secondary-tea pt-6">
        <h4 className="text-base font-heading font-semibold text-dark-tea mb-4">Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-secondary-tea mb-1">Coffee Served (value)</label>
            <input
              type="text"
              value={(content.settings?.coffeeServed as string) || ''}
              onChange={(e) => handleSettingsChange('coffeeServed', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
              placeholder="36546"
            />
          </div>
          <div>
            <label className="block text-sm text-secondary-tea mb-1">Types of Coffees (value)</label>
            <input
              type="text"
              value={(content.settings?.coffeeTypes as string) || ''}
              onChange={(e) => handleSettingsChange('coffeeTypes', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
              placeholder="28"
            />
          </div>
          <div>
            <label className="block text-sm text-secondary-tea mb-1">Years of Experience (optional extra stat)</label>
            <input
              type="text"
              value={(content.settings?.extraStatValue as string) || ''}
              onChange={(e) => handleSettingsChange('extraStatValue', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
              placeholder="e.g. 10+"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-secondary-tea mb-1">Extra Stat Label (e.g. Years of Experience)</label>
            <input
              type="text"
              value={(content.settings?.extraStatLabel as string) || ''}
              onChange={(e) => handleSettingsChange('extraStatLabel', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
              placeholder="Years of Experience"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutValuesEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Our Values"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            + Add Value Card
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {(content.items || []).map((item, index) => (
          <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
            <div className="flex justify-between items-start mb-3">
              <h5 className="font-medium text-dark-tea">Value {index + 1}</h5>
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-secondary-tea mb-1">Value Title</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => handleItemsChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                  placeholder="e.g. Quality"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary-tea mb-1">Icon (emoji or leave blank)</label>
                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(e) => handleItemsChange(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                  placeholder="⭐ or leave blank for default icon"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-secondary-tea mb-1">Description</label>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm resize-none"
                  placeholder="Describe this value…"
                />
              </div>
            </div>
            {item.title && (
              <div className="mt-3 pt-3 border-t border-secondary-tea flex items-center gap-2">
                <span className="text-xl">{item.icon || '✨'}</span>
                <div>
                  <p className="text-sm font-medium text-dark-tea">{item.title}</p>
                  {item.description && <p className="text-xs text-secondary-tea line-clamp-1">{item.description}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
        {(content.items || []).length === 0 && (
          <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
            <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="font-medium">No value cards added yet</p>
            <p className="text-sm mt-1">Click "Add Value Card" to add your company values</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeamEditor = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            name="title"
            value={content.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="Meet Our Team"
          />
        </div>
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={content.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="The passionate people behind Date & Maple"
          />
        </div>
      </div>

      <div className="border-t border-secondary-tea pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-heading font-semibold text-dark-tea">Team Members</h4>
          <button
            onClick={addItem}
            className="btn-primary text-sm py-2 px-4"
          >
            Add Member
          </button>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {(content.items || []).map((item, index) => (
            <div key={index} className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-dark-tea">Member {index + 1}</h5>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Full Name</label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => handleItemsChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-tea mb-1">Role / Position</label>
                  <input
                    type="text"
                    value={item.role || ''}
                    onChange={(e) => handleItemsChange(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                    placeholder="e.g. Founder & Head Chef"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Profile Photo</label>
                  {/* Tab toggle: URL vs Upload */}
                  <div className="flex border-b border-secondary-tea mb-2">
                    <button
                      type="button"
                      onClick={() => setMemberImageMode(index, 'url')}
                      className={`py-1.5 px-4 text-xs font-medium transition-all ${
                        (memberImageModes[index] ?? 'url') === 'url'
                          ? 'border-b-2 border-primary-tea text-primary-tea'
                          : 'text-secondary-tea hover:text-dark-tea'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberImageMode(index, 'upload')}
                      className={`py-1.5 px-4 text-xs font-medium transition-all ${
                        (memberImageModes[index] ?? 'url') === 'upload'
                          ? 'border-b-2 border-primary-tea text-primary-tea'
                          : 'text-secondary-tea hover:text-dark-tea'
                      }`}
                    >
                      Upload Photo
                    </button>
                  </div>

                  {(memberImageModes[index] ?? 'url') === 'url' ? (
                    <input
                      type="text"
                      value={item.image || ''}
                      onChange={(e) => handleItemsChange(index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm"
                      placeholder="https://example.com/photo.jpg (leave blank for initials avatar)"
                    />
                  ) : (
                    <div>
                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { memberFileRefs.current[index] = el; }}
                        className="hidden"
                        onChange={(e) => handleMemberFileChange(index, e.target.files?.[0] || null)}
                      />
                      {memberUploading[index] ? (
                        <div className="flex items-center gap-2 py-4 px-3 border border-secondary-tea rounded-md text-sm text-secondary-tea">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-tea" />
                          <span>Uploading...</span>
                        </div>
                      ) : memberPreviews[index] || item.image ? (
                        <div className="flex items-center gap-3 py-2 px-3 border border-secondary-tea rounded-md bg-light-tea">
                          <img
                            src={memberPreviews[index] || item.image || ''}
                            alt="preview"
                            className="w-10 h-10 rounded-full object-cover border-2 border-secondary-tea flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="text-xs text-dark-tea flex-1 truncate">{item.image}</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleItemsChange(index, 'image', '');
                              setMemberPreviews(prev => { const n = [...prev]; n[index] = null; return n; });
                              if (memberFileRefs.current[index]) memberFileRefs.current[index]!.value = '';
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => memberFileRefs.current[index]?.click()}
                          className="w-full py-6 border-2 border-dashed border-secondary-tea rounded-md text-center hover:border-primary-tea hover:bg-light-tea transition-colors cursor-pointer"
                        >
                          <svg className="w-8 h-8 text-secondary-tea mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-xs text-secondary-tea">Click to upload photo (max 5MB)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-secondary-tea mb-1">Bio / Description</label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemsChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md text-sm resize-none"
                    placeholder="A short bio about this team member..."
                  />
                </div>
              </div>

              {/* Preview */}
              {item.name && (
                <div className="mt-3 pt-3 border-t border-secondary-tea flex items-center gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-light-tea"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-tea flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(item.name.split(' ').map((w: string) => w[0]).join('')).toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-dark-tea">{item.name}</p>
                    {item.role && <p className="text-xs text-accent-tea">{item.role}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}

          {(content.items || []).length === 0 && (
            <div className="text-center py-8 text-secondary-tea border-2 border-dashed border-secondary-tea rounded-lg">
              <svg className="w-12 h-12 mx-auto text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p className="font-medium">No team members added yet</p>
              <p className="text-sm mt-1">Click "Add Member" to showcase your team</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const sectionRenderers = {
    hero: renderHeroEditor,
    features: renderFeaturesEditor,
    menuHighlights: renderMenuHighlightsEditor,
    gallery: renderGalleryEditor,
    catering: renderCateringEditor,
    testimonials: renderTestimonialsEditor,
    newsletter: renderNewsletterEditor,
    footer: renderFooterEditor,
    team: renderTeamEditor,
    aboutStory: renderAboutStoryEditor,
    aboutValues: renderAboutValuesEditor
  };

  const renderer = sectionRenderers[section as keyof typeof sectionRenderers] || renderHeroEditor;
  const sectionTitles = {
    hero: 'Hero Section',
    features: 'Features Section',
    menuHighlights: 'Menu Highlights',
    gallery: 'Gallery Section',
    catering: 'Catering Services',
    testimonials: 'Testimonials',
    newsletter: 'Newsletter Signup',
    footer: 'Footer Content',
    team: 'Meet Our Team',
    aboutStory: 'Our Story (About Page)',
    aboutValues: 'Our Values (About Page)'
  };
  
  const sectionTitle = sectionTitles[section as keyof typeof sectionTitles] || 'Hero Section';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-heading font-semibold text-primary-tea">
              Edit {sectionTitle}
            </h3>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            {renderer()}
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

      {/* Success Modal */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success!"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        confirmButtonClass="bg-primary-tea hover:bg-dark-tea"
        iconType="success"
      />
    </div>
  );
};

export default HomePageContentEditor;