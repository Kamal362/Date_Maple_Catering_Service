import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile, changePassword } from '../services/authService';
import { useToast } from '../context/ToastContext';

const AdminProfile: React.FC = () => {
  const [adminData, setAdminData] = useState<any>({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    createdAt: '',
    lastLogin: 'Just now',
    permissions: [],
    avatar: null
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const toast = useToast();

  const permissions = [
    'Manage Menu Items',
    'Manage Payment Methods',
    'View Orders',
    'Manage Users',
    'View Analytics',
    'Manage Events',
    'Process Payments',
    'Generate Reports'
  ];

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAdminData({
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: 'Just now', // Would come from API in real app
        permissions,
        avatar: user.avatar || null
      });
      
      setEditFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setLoading(false);
  }, []);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handleAvatarChange = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    
    try {
      // Simulate avatar upload
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      // In real implementation, you would call an API endpoint
      // const response = await uploadAvatar(formData);
      
      // For demo purposes, just update local state
      const avatarUrl = URL.createObjectURL(avatarFile);
      setAdminData((prev: any) => ({
        ...prev,
        avatar: avatarUrl
      }));
      
      toast.success('Profile picture updated successfully!');
      setShowAvatarModal(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
    }
  };

  const removeAvatar = () => {
    setAdminData((prev: any) => ({
      ...prev,
      avatar: null
    }));
    toast.success('Profile picture removed');
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await updateProfile(editFormData);
      if (response.success) {
        // Update local state
        setAdminData((prev: any) => ({
          ...prev,
          name: `${editFormData.firstName} ${editFormData.lastName}`,
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email
        }));
        
        toast.success('Profile updated successfully!');
        setShowEditModal(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordFormData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        // Reset form
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="section-padding bg-cream flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto mb-4"></div>
          <p className="text-dark-tea">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!adminData.name) {
    return (
      <div className="section-padding bg-cream flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-2xl font-heading font-semibold text-dark-tea mb-2">No Profile Data</h2>
          <p className="text-secondary-tea mb-4">Please log in as an admin to view your profile</p>
          <a href="/login" className="btn-primary inline-block">Go to Login</a>
        </div>
      </div>
    );
  }

  {/* Avatar Modal */}
  const renderAvatarModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-heading font-semibold text-primary-tea">Change Profile Picture</h3>
            <button 
              onClick={() => {
                setShowAvatarModal(false);
                setAvatarFile(null);
                setAvatarPreview(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
              id="avatar-upload"
            />
            
            <label 
              htmlFor="avatar-upload"
              className="block w-full px-6 py-8 border-2 border-dashed border-secondary-tea rounded-lg text-center cursor-pointer hover:border-primary-tea hover:bg-light-tea transition-all duration-200"
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-secondary-tea mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <span className="text-dark-tea font-medium">Upload New Picture</span>
                <span className="text-sm text-secondary-tea mt-1">PNG, JPG, GIF up to 5MB</span>
              </div>
            </label>
            
            {avatarPreview && (
              <div className="border border-secondary-tea rounded-lg p-4 bg-light-tea">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={avatarPreview} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-primary-tea"
                    />
                    <div>
                      <p className="font-medium text-dark-tea">{avatarFile?.name}</p>
                      <p className="text-sm text-secondary-tea">
                        {(avatarFile?.size || 0 / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAvatarModal(false);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}
                className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                disabled={!avatarFile}
                className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Picture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  {/* Edit Profile Modal */}
  const renderEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-heading font-semibold text-primary-tea">Edit Profile</h3>
            <button 
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSaveProfile}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-tea text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
                <div>
                  <label className="block text-dark-tea text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  required
                />
              </div>
              
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-secondary-tea">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  {/* Password Change Modal */}
  const renderPasswordModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-heading font-semibold text-primary-tea">Change Password</h3>
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSavePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  required
                />
              </div>
              
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  minLength={6}
                  required
                />
                <p className="text-xs text-secondary-tea mt-1">Must be at least 6 characters long</p>
              </div>
              
              <div>
                <label className="block text-dark-tea text-sm font-medium mb-2">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-secondary-tea">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary-tea">Admin Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {adminData.avatar ? (
                    <img 
                      src={adminData.avatar} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-tea shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-tea rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-cream">
                        {adminData.name ? adminData.name.charAt(0) : 'A'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleAvatarChange}
                    className="absolute bottom-0 right-0 bg-primary-tea text-cream rounded-full p-2 shadow-md hover:bg-accent-tea transition-all duration-200"
                    title="Change profile picture"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </button>
                </div>
                <h2 className="text-2xl font-heading font-semibold text-dark-tea">{adminData.name}</h2>
                <p className="text-secondary-tea mb-2">{adminData.email}</p>
                {adminData.phone && (
                  <p className="text-secondary-tea text-sm mb-3">{adminData.phone}</p>
                )}
                <span className="inline-block px-3 py-1 bg-primary-tea text-cream rounded-full text-sm font-medium">
                  {adminData.role.toUpperCase()}
                </span>
              </div>
              
              <div className="border-t border-secondary-tea pt-4">
                <h3 className="font-heading font-semibold text-lg mb-3">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Member Since:</span>
                    <span className="text-dark-tea font-medium">
                      {new Date(adminData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Last Login:</span>
                    <span className="text-dark-tea font-medium">{adminData.lastLogin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Role:</span>
                    <span className="text-dark-tea font-medium capitalize">{adminData.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleEditProfile}
                  className="w-full px-4 py-3 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Profile
                </button>
                <button 
                  onClick={handlePasswordChange}
                  className="w-full px-4 py-3 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                  Change Password
                </button>
              </div>
            </div>
          </div>
          
          {/* Permissions and Activity */}
          <div className="lg:col-span-2">
            <div className="card p-6 mb-8">
              <h3 className="font-heading font-semibold text-xl mb-4 text-dark-tea">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminData.permissions.map((permission: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-accent-tea mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-dark-tea">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-xl mb-4 text-dark-tea">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-4">
                    <div className="w-10 h-10 bg-light-tea rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-dark-tea">Added new menu item: Maple Latte</p>
                    <p className="text-sm text-secondary-tea">Today, 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4">
                    <div className="w-10 h-10 bg-light-tea rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-dark-tea">Updated payment method: PayPal</p>
                    <p className="text-sm text-secondary-tea">Yesterday, 3:45 PM</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4">
                    <div className="w-10 h-10 bg-light-tea rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-dark-tea">Removed menu item: Seasonal Special</p>
                    <p className="text-sm text-secondary-tea">Dec 12, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showAvatarModal && renderAvatarModal()}
      {showEditModal && renderEditModal()}
      {showPasswordModal && renderPasswordModal()}
    </div>
  );
};

export default AdminProfile;