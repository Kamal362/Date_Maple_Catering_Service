import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  getAllHomePageContent,
  createOrUpdateHomePageContent,
  deleteHomePageContent,
  HomePageContent,
} from '../services/homeContentService';

interface AdminContentEditorProps {
  onClose?: () => void;
}

const AdminContentEditor: React.FC<AdminContentEditorProps> = ({ onClose }) => {
  const [sections, setSections] = useState<HomePageContent[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const sectionList = [
    { id: 'hero', name: 'Hero Section', description: 'Main banner with call-to-action' },
    { id: 'features', name: 'Features Section', description: 'Key features/benefits' },
    { id: 'menuHighlights', name: 'Menu Highlights', description: 'Featured menu items' },
    { id: 'gallery', name: 'Gallery', description: 'Image gallery showcase' },
    { id: 'catering', name: 'Catering Services', description: 'Catering information' },
    { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews' },
    { id: 'newsletter', name: 'Newsletter', description: 'Newsletter subscription' },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const content = await getAllHomePageContent();
      setSections(content);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    const existing = sections.find((s) => s.section === sectionId);
    
    if (existing) {
      setEditingContent(existing);
    } else {
      setEditingContent({
        section: sectionId,
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        buttonLink: '',
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingContent((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!editingContent) return;

    try {
      setSaving(true);
      await createOrUpdateHomePageContent(editingContent);
      toast.success('Content saved successfully!');
      await fetchContent();
      setSelectedSection(null);
      setEditingContent(null);
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedSection(null);
    setEditingContent(null);
  };

  const handleDelete = async () => {
    if (!editingContent || !editingContent._id) return;
    
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await deleteHomePageContent(editingContent.section);
      toast.success('Content deleted successfully!');
      await fetchContent();
      setSelectedSection(null);
      setEditingContent(null);
    } catch (error) {
      toast.error('Failed to delete content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-tea">
              Content Management
            </h1>
            <p className="text-dark-tea mt-2">
              Edit all website content in real-time
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-semibold mb-4 text-primary-tea">
                Sections
              </h2>
              <div className="space-y-2">
                {sectionList.map((section) => {
                  const hasContent = sections.some((s) => s.section === section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionSelect(section.id)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedSection === section.id
                          ? 'bg-primary-tea text-cream'
                          : 'bg-light-tea text-dark-tea hover:bg-secondary-tea'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{section.name}</h3>
                          <p className="text-sm opacity-80">{section.description}</p>
                        </div>
                        {hasContent && (
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2">
            {!selectedSection ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-secondary-tea"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="text-xl font-heading font-semibold text-dark-tea mb-2">
                  Select a Section
                </h3>
                <p className="text-secondary-tea">
                  Choose a section from the left to edit its content
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-heading font-bold text-primary-tea mb-6">
                  Edit {sectionList.find((s) => s.id === selectedSection)?.name}
                </h2>

                <form className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-dark-tea font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editingContent?.title || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      placeholder="Enter section title"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-dark-tea font-medium mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={editingContent?.subtitle || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      placeholder="Enter section subtitle"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-dark-tea font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editingContent?.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      placeholder="Enter section description"
                    />
                  </div>

                  {/* Button Text */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-dark-tea font-medium mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        name="buttonText"
                        value={editingContent?.buttonText || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="e.g., Learn More"
                      />
                    </div>

                    {/* Button Link */}
                    <div>
                      <label className="block text-dark-tea font-medium mb-2">
                        Button Link
                      </label>
                      <input
                        type="text"
                        name="buttonLink"
                        value={editingContent?.buttonLink || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="e.g., /menu"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-secondary-tea">
                    <div>
                      {editingContent?._id && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                          disabled={saving}
                        >
                          {saving ? 'Deleting...' : 'Delete Content'}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="btn-primary px-6 py-2"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Live Preview */}
                <div className="mt-8 p-6 bg-light-tea rounded-lg border-2 border-dashed border-secondary-tea">
                  <h3 className="text-lg font-heading font-semibold mb-4 text-primary-tea">
                    Live Preview
                  </h3>
                  <div className="space-y-2">
                    {editingContent?.title && (
                      <h4 className="text-2xl font-heading font-bold text-primary-tea">
                        {editingContent.title}
                      </h4>
                    )}
                    {editingContent?.subtitle && (
                      <p className="text-lg text-dark-tea">
                        {editingContent.subtitle}
                      </p>
                    )}
                    {editingContent?.description && (
                      <p className="text-secondary-tea">
                        {editingContent.description}
                      </p>
                    )}
                    {editingContent?.buttonText && (
                      <button className="btn-primary mt-4">
                        {editingContent.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentEditor;
