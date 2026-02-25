import React, { useState, useEffect } from 'react';
import { getAllHomePageContent, deleteHomePageContent, HomePageContent } from '../services/homeContentService';
import HomePageContentEditor from '../components/HomePageContentEditor';
import ConfirmModal from '../components/ConfirmModal';

const AdminHomeContent: React.FC = () => {
  const [content, setContent] = useState<HomePageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await getAllHomePageContent();
      setContent(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching homepage content:', err);
      setError('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setShowEditor(true);
  };

  const handleSave = () => {
    fetchContent();
    setShowEditor(false);
    setEditingSection(null);
    setSuccessMessage('Homepage content has been saved successfully!');
    setShowSuccessModal(true);
  };

  const handleDeleteClick = (section: string) => {
    setSectionToDelete(section);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;
    
    try {
      await deleteHomePageContent(sectionToDelete);
      fetchContent();
      setSuccessMessage('Homepage content has been deleted successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting content:', err);
      setError('Failed to delete content');
    } finally {
      setShowDeleteModal(false);
      setSectionToDelete(null);
    }
  };

  const sections = [
    { key: 'hero', label: 'Hero Section', description: 'Main banner and welcome message' },
    { key: 'features', label: 'Features Section', description: 'Key features and highlights' },
    { key: 'menuHighlights', label: 'Menu Highlights', description: 'Featured menu items' },
    { key: 'gallery', label: 'Gallery Section', description: 'Photo gallery showcase' },
    { key: 'catering', label: 'Catering Services', description: 'Catering information and services' },
    { key: 'testimonials', label: 'Testimonials', description: 'Customer reviews and testimonials' },
    { key: 'newsletter', label: 'Newsletter', description: 'Newsletter signup section' },
    { key: 'footer', label: 'Footer', description: 'Footer content and links' },
  ];

  const getSectionContent = (sectionKey: string) => {
    return content.find(c => c.section === sectionKey);
  };

  const getEmptySections = () => {
    return sections.filter(s => !getSectionContent(s.key));
  };

  const getActiveSections = () => {
    return sections.filter(s => getSectionContent(s.key));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Homepage Content Management</h1>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {getActiveSections().length} Active
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {getEmptySections().length} Empty
            </span>
          </div>
          
          {/* Create New Section Dropdown */}
          <div className="relative group">
            <button 
              onClick={() => {
                const emptySections = getEmptySections();
                if (emptySections.length === 1) {
                  // If only one empty section, open it directly
                  handleEdit(emptySections[0].key);
                }
                // Otherwise dropdown will show on hover
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                getEmptySections().length > 0 
                  ? 'bg-primary-tea hover:bg-dark-tea text-white cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={getEmptySections().length === 0}
              title={getEmptySections().length === 0 ? 'All sections are already created' : 'Create new section content'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              {getEmptySections().length > 0 ? 'Create New Section' : 'All Sections Created'}
              {getEmptySections().length > 1 && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              )}
            </button>
            {getEmptySections().length > 1 && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                <div className="py-2">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Available Sections</p>
                  {getEmptySections().map((section) => (
                    <button
                      key={section.key}
                      onClick={() => handleEdit(section.key)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-light-tea hover:text-dark-tea transition-colors"
                    >
                      <span className="font-medium">{section.label}</span>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const sectionContent = getSectionContent(section.key);
            return (
              <div key={section.key} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  </div>
                  {sectionContent ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Empty
                    </span>
                  )}
                </div>
                
                {sectionContent && (
                  <div className="mb-4 text-sm text-gray-600">
                    <p className="truncate">{sectionContent.title || sectionContent.subtitle || 'No title'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last updated: {sectionContent.updatedAt ? new Date(sectionContent.updatedAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(section.key)}
                    className="flex-1 bg-primary-tea hover:bg-dark-tea text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {sectionContent ? 'Edit Content' : 'Add Content'}
                  </button>
                  {sectionContent && (
                    <button
                      onClick={() => handleDeleteClick(section.key)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                      title="Delete Content"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Editor Modal */}
      {showEditor && editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <HomePageContentEditor
              section={editingSection}
              onSave={handleSave}
              onClose={() => {
                setShowEditor(false);
                setEditingSection(null);
              }}
            />
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Content"
        message={`Are you sure you want to delete the content for "${sectionToDelete ? sections.find(s => s.key === sectionToDelete)?.label : ''}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        iconType="warning"
      />
    </div>
  );
};

export default AdminHomeContent;
