import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile, changePassword } from '../services/authService';
import { getMyOrders } from '../services/orderService';
import { getMyEvents } from '../services/eventService';
import { useToast } from '../context/ToastContext';
import OrderHistory from '../components/OrderHistory';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Handle URL hash to switch tabs
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#orders') {
        setActiveTab('orders');
      }
    };

    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const toast = useToast();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        if (user) {
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zipCode: user.zipCode || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [toast]);

  // Load orders when orders tab is selected
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  // Load events when events tab is selected
  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      const ordersData = await getMyOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load order history');
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await getMyEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load event history');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    
    try {
      const response = await updateProfile(profileData);
      if (response.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
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

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold mb-8 text-primary-tea">My Account</h1>
        
        <div className="card">
          <div className="border-b border-secondary-tea">
            <nav className="flex flex-wrap gap-2 sm:gap-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-primary-tea border-b-2 border-primary-tea'
                    : 'text-dark-tea hover:text-primary-tea'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg transition-colors whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'text-primary-tea border-b-2 border-primary-tea'
                    : 'text-dark-tea hover:text-primary-tea'
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg transition-colors whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'text-primary-tea border-b-2 border-primary-tea'
                    : 'text-dark-tea hover:text-primary-tea'
                }`}
              >
                Event History
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="ml-auto px-4 sm:px-6 py-3 sm:py-4 font-medium text-base sm:text-lg text-dark-tea hover:text-primary-tea transition-colors whitespace-nowrap"
              >
                Change Password
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-dark-tea mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-dark-tea mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-dark-tea mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-dark-tea mb-2">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-dark-tea mb-2">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-dark-tea mb-2">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={profileData.city}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-dark-tea mb-2">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={profileData.state}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-dark-tea mb-2">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={profileData.zipCode}
                      onChange={handleProfileChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 pt-4">
                    <button 
                      type="submit" 
                      disabled={profileLoading}
                      className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base flex items-center justify-center"
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cream mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-6">Order History</h2>
                <OrderHistory />
              </div>
            )}
            
            {activeTab === 'events' && (
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-6">Event History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-3 px-4">Event ID</th>
                        <th className="text-left py-3 px-4">Event Type</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Guests</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event._id} className="border-b border-secondary-tea">
                          <td className="py-3 px-4">{event._id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{event.eventType}</td>
                          <td className="py-3 px-4">{event.eventDate}</td>
                          <td className="py-3 px-4">{event.guestCount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              event.status === 'confirmed' 
                                ? 'bg-primary-tea text-cream' 
                                : event.status === 'pending' 
                                  ? 'bg-secondary-tea text-dark-tea' 
                                  : event.status === 'completed'
                                    ? 'bg-accent-tea text-cream'
                                    : event.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-semibold text-primary-tea">
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                  <p className="mt-1 text-xs text-secondary-tea">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="btn-secondary"
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cream mr-2"></div>
                        Changing...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;