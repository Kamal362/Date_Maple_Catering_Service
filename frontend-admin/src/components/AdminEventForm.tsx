import React, { useState, useEffect, useRef } from 'react';

interface EventFlyer {
  _id?: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  flyerImage?: string;
  priority?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminEventFormProps {
  event?: EventFlyer;
  onSave: (event: EventFlyer) => void;
  onCancel: () => void;
}

const AdminEventForm: React.FC<AdminEventFormProps> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EventFlyer>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    flyerImage: '',
    priority: 0,
    isActive: true
  });
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setFormData(event);
      if (event.flyerImage) {
        setPreviewImage(event.flyerImage);
      }
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'flyerImage') {
        setPreviewImage(value);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file to server
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, flyerImage: data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileChange({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
        <input
          type="date"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Flyer Image</label>
        
        {/* Upload Method Toggle */}
        <div className="flex space-x-4 mb-3">
          <button
            type="button"
            onClick={() => setUploadMethod('url')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'url'
                ? 'bg-primary-tea text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'file'
                ? 'bg-primary-tea text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload from Computer
          </button>
        </div>

        {/* URL Input */}
        {uploadMethod === 'url' && (
          <input
            type="url"
            name="flyerImage"
            value={formData.flyerImage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="https://example.com/image.jpg"
          />
        )}

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary-tea transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-tea mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-primary-tea">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </div>
        )}

        {/* Image Preview */}
        {previewImage && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div className="relative w-48 h-48 rounded-md overflow-hidden border border-gray-200">
              <img
                src={previewImage}
                alt="Flyer preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewImage('')}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <input
          type="number"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          min="0"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Active</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-tea text-white rounded-md hover:bg-dark-tea transition-colors"
        >
          {event?._id ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default AdminEventForm;
