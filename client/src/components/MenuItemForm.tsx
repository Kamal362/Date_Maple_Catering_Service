import React, { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../types/menu';

interface MenuItemFormProps {
  menuItem?: MenuItem | null;
  onSave: (item: Partial<MenuItem>) => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    available: true,
    dietary: [],
    altMilkOptions: [],
    coldFoamAvailable: false,
    // Initialize image as empty string instead of undefined
    image: ''
  });
  
  // State for dual image input
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (menuItem) {
      // When editing, convert image to string if it's a File
      const imageData = typeof menuItem.image === 'string' ? menuItem.image : '';
      setFormData({
        ...menuItem,
        image: imageData
      });
      
      // If the image is a URL, set the source to URL
      if (imageData) {
        setImageSource('url');
      }
    }
  }, [menuItem]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set the image data to the file for form submission
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    } else {
      setImagePreview(null);
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const dietary = prev.dietary || [];
      if (checked) {
        return { ...prev, dietary: [...dietary, value] };
      } else {
        return { ...prev, dietary: dietary.filter(d => d !== value) };
      }
    });
  };

  const handleAltMilkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const altMilkOptions = prev.altMilkOptions || [];
      if (checked) {
        return { ...prev, altMilkOptions: [...altMilkOptions, value] };
      } else {
        return { ...prev, altMilkOptions: altMilkOptions.filter(m => m !== value) };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];
  const altMilkOptions = ['Oat Milk', 'Almond Milk', 'Soy Milk', 'Coconut Milk'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-1">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
          required
        />
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-1">
            Price *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price || 0}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            required
          />
        </div>

        <div>
          <label className="block text-dark-tea text-sm font-medium mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            required
          >
            <option value="">Select a category</option>
            <option value="drinks">Drinks</option>
            <option value="food">Food</option>
            <option value="catering">Catering</option>
          </select>
        </div>
      </div>

      {/* Dual Image Input */}
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">
          Image
        </label>
        
        {/* Image source tabs */}
        <div className="flex border-b border-secondary-tea mb-2">
          <button
            type="button"
            onClick={() => setImageSource('url')}
            className={`py-2 px-4 text-sm font-medium ${
              imageSource === 'url'
                ? 'border-b-2 border-primary-tea text-primary-tea'
                : 'text-dark-tea hover:text-primary-tea'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setImageSource('upload')}
            className={`py-2 px-4 text-sm font-medium ${
              imageSource === 'upload'
                ? 'border-b-2 border-primary-tea text-primary-tea'
                : 'text-dark-tea hover:text-primary-tea'
            }`}
          >
            Upload
          </button>
        </div>
        
        {/* URL input */}
        {imageSource === 'url' && (
          <input
            type="text"
            name="image"
            value={typeof formData.image === 'string' ? formData.image : ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            placeholder="https://example.com/image.jpg"
          />
        )}
        
        {/* File upload */}
        {imageSource === 'upload' && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {!imageFile ? (
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-full px-4 py-8 border-2 border-dashed border-secondary-tea rounded-md text-center cursor-pointer hover:border-primary-tea hover:bg-light-tea transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-secondary-tea mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-dark-tea">Click to upload an image</span>
                  <span className="text-sm text-secondary-tea mt-1">PNG, JPG, GIF up to 10MB</span>
                </div>
              </button>
            ) : (
              <div className="border border-secondary-tea rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-md mr-3"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-dark-tea">{imageFile.name}</p>
                      <p className="text-xs text-secondary-tea">
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="available"
          checked={formData.available || false}
          onChange={handleChange}
          className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
        />
        <label className="ml-2 block text-dark-tea text-sm">
          Available for purchase
        </label>
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">
          Dietary Information
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dietaryOptions.map(option => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                value={option}
                checked={formData.dietary?.includes(option) || false}
                onChange={handleDietaryChange}
                className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
              />
              <label className="ml-2 block text-dark-tea text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">
          Alternative Milk Options
        </label>
        <div className="grid grid-cols-2 gap-2">
          {altMilkOptions.map(option => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                value={option}
                checked={formData.altMilkOptions?.includes(option) || false}
                onChange={handleAltMilkChange}
                className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
              />
              <label className="ml-2 block text-dark-tea text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="coldFoamAvailable"
          checked={formData.coldFoamAvailable || false}
          onChange={handleChange}
          className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
        />
        <label className="ml-2 block text-dark-tea text-sm">
          Cold Foam Available
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors"
        >
          {menuItem ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;