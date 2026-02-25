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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">
          Item Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
          placeholder="Enter menu item name"
          required
        />
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea resize-none"
          placeholder="Describe the menu item (ingredients, preparation, etc.)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price || 0}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder="0.00"
            required
          />
          <div className="text-xs text-secondary-tea mt-1">
            Enter price in USD ($)
          </div>
        </div>

        <div>
          <label className="block text-dark-tea text-sm font-medium mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea bg-white"
            required
          >
            <option value="">Choose category</option>
            <option value="drinks">Drinks</option>
            <option value="food">Food</option>
            <option value="catering">Catering</option>
          </select>
        </div>
      </div>

      {/* Dual Image Input */}
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-3">
          Item Image
        </label>
        
        {/* Image source tabs */}
        <div className="flex border-b border-secondary-tea mb-3">
          <button
            type="button"
            onClick={() => setImageSource('url')}
            className={`py-3 px-5 text-sm font-medium transition-all duration-200 ${
              imageSource === 'url'
                ? 'border-b-2 border-primary-tea text-primary-tea font-semibold'
                : 'text-dark-tea hover:text-primary-tea hover:bg-light-tea'
            }`}
          >
            Image URL
          </button>
          <button
            type="button"
            onClick={() => setImageSource('upload')}
            className={`py-3 px-5 text-sm font-medium transition-all duration-200 ${
              imageSource === 'upload'
                ? 'border-b-2 border-primary-tea text-primary-tea font-semibold'
                : 'text-dark-tea hover:text-primary-tea hover:bg-light-tea'
            }`}
          >
            Upload Image
          </button>
        </div>
        
        {/* URL input */}
        {imageSource === 'url' && (
          <input
            type="url"
            name="image"
            value={typeof formData.image === 'string' ? formData.image : ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            placeholder="https://example.com/item-image.jpg"
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
                className="w-full px-6 py-10 border-2 border-dashed border-secondary-tea rounded-lg text-center cursor-pointer hover:border-primary-tea hover:bg-light-tea transition-all duration-200 group"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-secondary-tea mb-3 group-hover:text-primary-tea transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="text-dark-tea font-medium text-lg mb-1">Upload Image</span>
                  <span className="text-sm text-secondary-tea">Supports PNG, JPG, GIF (Max 10MB)</span>
                </div>
              </button>
            ) : (
              <div className="border border-secondary-tea rounded-lg p-5 bg-light-tea">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg mr-4 border-2 border-secondary-tea"
                      />
                    )}
                    <div>
                      <p className="text-base font-semibold text-dark-tea">{imageFile.name}</p>
                      <p className="text-sm text-secondary-tea">
                        Size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center pt-2">
        <input
          type="checkbox"
          name="available"
          checked={formData.available || false}
          onChange={handleChange}
          className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea border-secondary-tea rounded"
        />
        <label className="ml-3 block text-dark-tea text-sm font-medium">
          Make this item available for purchase
        </label>
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-3">
          Dietary Information
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dietaryOptions.map(option => (
            <div key={option} className="flex items-center bg-light-tea rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200">
              <input
                type="checkbox"
                value={option}
                checked={formData.dietary?.includes(option) || false}
                onChange={handleDietaryChange}
                className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea border-secondary-tea rounded"
              />
              <label className="ml-3 block text-dark-tea text-sm font-medium">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-dark-tea text-sm font-medium mb-3">
          Alternative Milk Options
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {altMilkOptions.map(option => (
            <div key={option} className="flex items-center bg-light-tea rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200">
              <input
                type="checkbox"
                value={option}
                checked={formData.altMilkOptions?.includes(option) || false}
                onChange={handleAltMilkChange}
                className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea border-secondary-tea rounded"
              />
              <label className="ml-3 block text-dark-tea text-sm font-medium">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center pt-2">
        <input
          type="checkbox"
          name="coldFoamAvailable"
          checked={formData.coldFoamAvailable || false}
          onChange={handleChange}
          className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea border-secondary-tea rounded"
        />
        <label className="ml-3 block text-dark-tea text-sm font-medium">
          Cold Foam Available
        </label>
      </div>

      <div className="pt-6 border-t border-secondary-tea">
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            {menuItem ? 'Update Menu Item' : 'Add Menu Item'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MenuItemForm;