import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile, changePassword } from '../services/authService';

const AdminProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await updateProfile(profileData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update local user data
        const updatedUser = getCurrentUser();
        setUser(updatedUser);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }
    
    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to change password' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary-tea mb-6">Admin Profile</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-secondary-tea">
          <h2 className="text-xl font-heading font-semibold text-dark-tea mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-primary-tea hover:bg-dark-tea text-cream py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-secondary-tea">
          <h2 className="text-xl font-heading font-semibold text-dark-tea mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-tea mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-primary-tea hover:bg-dark-tea text-cream py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-secondary-tea">
        <h2 className="text-xl font-heading font-semibold text-dark-tea mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">User ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminProfile;