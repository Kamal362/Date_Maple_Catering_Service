import React, { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuService';
import { MenuItem as MenuItemType } from '../types/menu';
import MenuItemForm from '../components/MenuItemForm';
import ConfirmModal from '../components/ConfirmModal';

const AdminMenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('all');
  const [menuFilterAvailability, setMenuFilterAvailability] = useState('all');
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this item?'
  });
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await getMenuItems();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = () => {
    setEditingMenuItem(null);
    setShowMenuItemModal(true);
  };

  const handleEditMenuItem = (item: MenuItemType) => {
    setEditingMenuItem(item);
    setShowMenuItemModal(true);
  };

  const handleDeleteMenuItem = (item: MenuItemType) => {
    setDeleteModalConfig({
      title: 'Delete Menu Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    });
    setDeleteAction(() => async () => {
      try {
        await deleteMenuItem(item.id || '');
        await fetchMenuItems();
        setShowDeleteModal(false);
      } catch (err) {
        console.error('Error deleting menu item:', err);
        setError('Failed to delete menu item');
      }
    });
    setShowDeleteModal(true);
  };

  const handleSaveMenuItem = async (item: Partial<MenuItemType>) => {
    try {
      if (editingMenuItem && editingMenuItem.id) {
        await updateMenuItem(editingMenuItem.id, item);
      } else {
        await createMenuItem(item);
      }
      await fetchMenuItems();
      setShowMenuItemModal(false);
      setEditingMenuItem(null);
    } catch (err) {
      console.error('Error saving menu item:', err);
      setError('Failed to save menu item');
    }
  };

  const toggleMenuItemAvailability = async (item: MenuItemType) => {
    try {
      await updateMenuItem(item.id || '', { available: !item.available });
      await fetchMenuItems();
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Failed to update availability');
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = !menuSearchTerm || 
      item.name?.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(menuSearchTerm.toLowerCase());
    const matchesCategory = menuFilterCategory === 'all' || item.category === menuFilterCategory;
    const matchesAvailability = menuFilterAvailability === 'all' || 
      (menuFilterAvailability === 'available' && item.available) ||
      (menuFilterAvailability === 'unavailable' && !item.available);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Group by category
  const menuItemsByCategory = filteredMenuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItemType[]>);

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary-tea">Menu Management</h1>
        <button 
          onClick={handleAddMenuItem}
          className="bg-primary-tea hover:bg-dark-tea text-cream px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-200 hover:shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-secondary-tea">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-1">Search</label>
            <input
              type="text"
              placeholder="Search items..."
              className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
              value={menuSearchTerm}
              onChange={(e) => setMenuSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
              value={menuFilterCategory}
              onChange={(e) => setMenuFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="drinks">Drinks</option>
              <option value="food">Food</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-1">Availability</label>
            <select
              className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
              value={menuFilterAvailability}
              onChange={(e) => setMenuFilterAvailability(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
        </div>
        {(menuSearchTerm || menuFilterCategory !== 'all' || menuFilterAvailability !== 'all') && (
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                setMenuSearchTerm('');
                setMenuFilterCategory('all');
                setMenuFilterAvailability('all');
              }}
              className="text-sm text-primary-tea hover:text-dark-tea underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Menu Items Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu items...</p>
        </div>
      ) : Object.keys(menuItemsByCategory).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No menu items found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(menuItemsByCategory).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden border border-secondary-tea">
              <div className="bg-light-tea px-4 py-3 border-b border-secondary-tea">
                <h2 className="text-lg font-heading font-semibold capitalize text-dark-tea">{category}</h2>
              </div>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-light-tea z-10">
                    <tr className="border-b border-secondary-tea">
                      <th className="text-left py-3 px-4 text-dark-tea font-semibold">Name</th>
                      <th className="text-left py-3 px-4 text-dark-tea font-semibold">Price</th>
                      <th className="text-left py-3 px-4 text-dark-tea font-semibold">Description</th>
                      <th className="text-left py-3 px-4 text-dark-tea font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-dark-tea font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-secondary-tea hover:bg-light-tea/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4">${item.price?.toFixed(2)}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{item.description}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => toggleMenuItemAvailability(item)}
                              className="text-xs bg-secondary-tea/20 hover:bg-secondary-tea/40 text-dark-tea px-2 py-1 rounded-lg transition-all duration-200"
                            >
                              {item.available ? 'Disable' : 'Enable'}
                            </button>
                            <button 
                              onClick={() => handleEditMenuItem(item)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteMenuItem(item)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu Item Modal */}
      {showMenuItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <h2 className="text-2xl font-heading font-bold text-primary-tea mb-4">
                {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <MenuItemForm
                menuItem={editingMenuItem}
                onSave={handleSaveMenuItem}
                onCancel={() => {
                  setShowMenuItemModal(false);
                  setEditingMenuItem(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAction || (() => {})}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        cancelText="Cancel"
      />
    </div>
    </div>
  );
};

export default AdminMenuManagement;
