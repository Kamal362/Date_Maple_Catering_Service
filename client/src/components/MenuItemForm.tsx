import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types/menu';

interface MenuItemFormProps {
  menuItem?: MenuItem | null;
  onSave: (menuItem: MenuItem) => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    available: true,
    dietary: [] as string[],
    altMilkOptions: [] as string[],
    coldFoamAvailable: false
  });

  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name || '',
        description: menuItem.description || '',
        price: menuItem.price?.toString() || '',
        image: menuItem.image || '',
        category: menuItem.category || '',
        available: menuItem.available !== undefined ? menuItem.available : true,
        dietary: menuItem.dietary || [],
        altMilkOptions: menuItem.altMilkOptions || [],
        coldFoamAvailable: menuItem.coldFoamAvailable || false
      });
      
      // If there's an image URL, default to URL source
      if (menuItem.image) {
        setImageSource('url');
      }
    }
  }, [menuItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDietaryChange = (dietaryOption: string) => {
    setFormData(prev => {
      const dietary = [...prev.dietary];
      if (dietary.includes(dietaryOption)) {
        return { ...prev, dietary: dietary.filter(option => option !== dietaryOption) };
      } else {
        return { ...prev, dietary: [...dietary, dietaryOption] };
      }
    });
  };

  const handleAltMilkChange = (milkOption: string) => {
    setFormData(prev => {
      const altMilkOptions = [...prev.altMilkOptions];
      if (altMilkOptions.includes(milkOption)) {
        return { ...prev, altMilkOptions: altMilkOptions.filter(option => option !== milkOption) };
      } else {
        return { ...prev, altMilkOptions: [...altMilkOptions, milkOption] };
      }
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Clear URL when file is selected
      setFormData(prev => ({ ...prev, image: '' }));
      // Clear image error
      if (errors.image) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Validate image based on selected source
    if (imageSource === 'url' && formData.image.trim() === '' && !imageFile) {
      newErrors.image = 'Image URL is required';
    } else if (imageSource === 'upload' && !imageFile && !menuItem?.image) {
      newErrors.image = 'Image file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare form data for submission
    const submitData = new FormData();
    
    // Add all form fields
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    submitData.append('available', formData.available.toString());
    submitData.append('dietary', JSON.stringify(formData.dietary));
    submitData.append('altMilkOptions', JSON.stringify(formData.altMilkOptions));
    submitData.append('coldFoamAvailable', formData.coldFoamAvailable.toString());
    
    // Add image based on source
    if (imageSource === 'url' && formData.image) {
      submitData.append('image', formData.image);
    } else if (imageSource === 'upload' && imageFile) {
      submitData.append('image', imageFile);
    }

    // Convert back to object for the onSave callback
    const menuItemData: MenuItem = {
      id: menuItem?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      available: formData.available,
      dietary: formData.dietary,
      altMilkOptions: formData.altMilkOptions,
      coldFoamAvailable: formData.coldFoamAvailable
    };

    onSave(menuItemData);
  };

  const dietaryOptions = [
    { value: 'vegan-friendly', label: 'Vegan Friendly' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'dairy-free', label: 'Dairy Free' }
  ];

  const altMilkOptions = [
    { value: 'oat', label: 'Oat Milk' },
    { value: 'almond', label: 'Almond Milk' },
    { value: 'soy', label: 'Soy Milk' },
    { value: 'coconut', label: 'Coconut Milk' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <div>
        <label className="block text-dark-tea mb-1">Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm ${
            errors.name ? 'border-red-500' : 'border-secondary-tea'
          }`}
          placeholder="Menu item name"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-dark-tea mb-1">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm ${
            errors.description ? 'border-red-500' : 'border-secondary-tea'
          }`}
          placeholder="Describe the menu item"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-dark-tea mb-1">Price ($) *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm ${
            errors.price ? 'border-red-500' : 'border-secondary-tea'
          }`}
          placeholder="0.00"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      <div>
        <label className="block text-dark-tea mb-1">Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm ${
            errors.category ? 'border-red-500' : 'border-secondary-tea'
          }`}
        >
          <option value="">Select a category</option>
          <option value="drinks">Drinks</option>
          <option value="food">Food</option>
          <option value="catering">Catering</option>
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-dark-tea mb-1">Image *</label>
        
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
          <div>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm ${
                errors.image ? 'border-red-500' : 'border-secondary-tea'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>
        )}
        
        {/* File upload */}
        {imageSource === 'upload' && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm ${
                errors.image ? 'border-red-500' : 'border-secondary-tea'
              }`}
            />
            {imageFile && (
              <p className="text-xs text-dark-tea mt-1">
                Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleChange}
          className="mr-2 h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
        />
        <label className="text-dark-tea text-sm">Available</label>
      </div>

      <div>
        <label className="block text-dark-tea mb-1">Dietary Options</label>
        <div className="grid grid-cols-2 gap-1">
          {dietaryOptions.map(option => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.dietary.includes(option.value)}
                onChange={() => handleDietaryChange(option.value)}
                className="mr-1 h-3 w-3 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
              />
              <label className="text-dark-tea text-xs">{option.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-dark-tea mb-1">Alternative Milk Options</label>
        <div className="grid grid-cols-2 gap-1">
          {altMilkOptions.map(option => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.altMilkOptions.includes(option.value)}
                onChange={() => handleAltMilkChange(option.value)}
                className="mr-1 h-3 w-3 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
              />
              <label className="text-dark-tea text-xs">{option.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="coldFoamAvailable"
          checked={formData.coldFoamAvailable}
          onChange={handleChange}
          className="mr-2 h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
        />
        <label className="text-dark-tea text-sm">Cold Foam Available</label>
      </div>

      <div className="flex justify-end space-x-2 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-light-tea transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-dark-tea transition-colors text-sm"
        >
          {menuItem ? 'Update Menu Item' : 'Add Menu Item'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;