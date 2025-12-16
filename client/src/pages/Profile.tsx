import React, { useState } from 'react';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    address: '123 Main St',
    city: 'Cityville',
    state: 'ST',
    zipCode: '12345'
  });

  const [orderHistory] = useState([
    {
      id: 'ORD-001',
      date: '2023-05-15',
      items: 3,
      total: 24.50,
      status: 'Delivered'
    },
    {
      id: 'ORD-002',
      date: '2023-05-10',
      items: 2,
      total: 15.75,
      status: 'Delivered'
    },
    {
      id: 'ORD-003',
      date: '2023-05-05',
      items: 5,
      total: 32.25,
      status: 'Cancelled'
    }
  ]);

  const [eventHistory] = useState([
    {
      id: 'EV-001',
      name: 'Birthday Party',
      date: '2023-06-20',
      guests: 30,
      status: 'Confirmed'
    },
    {
      id: 'EV-002',
      name: 'Corporate Meeting',
      date: '2023-07-15',
      guests: 15,
      status: 'Pending'
    }
  ]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold mb-8 text-primary-tea">My Account</h1>
        
        <div className="card">
          <div className="border-b border-secondary-tea">
            <nav className="flex flex-wrap">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium text-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'text-primary-tea border-b-2 border-primary-tea'
                    : 'text-dark-tea hover:text-primary-tea'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-medium text-lg transition-colors ${
                  activeTab === 'orders'
                    ? 'text-primary-tea border-b-2 border-primary-tea'
                    : 'text-dark-tea hover:text-primary-tea'
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-4 font-medium text-lg transition-colors ${
                  activeTab === 'events'
                    ? 'text-primary-tea border-b-2 border-primary-tea'
                    : 'text-dark-tea hover:text-primary-tea'
                }`}
              >
                Event History
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-dark-tea mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    />
                  </div>
                  
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="btn-primary px-8 py-3">
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-heading font-semibold mb-6">Order History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.id} className="border-b border-secondary-tea">
                          <td className="py-3 px-4">{order.id}</td>
                          <td className="py-3 px-4">{order.date}</td>
                          <td className="py-3 px-4">{order.items}</td>
                          <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'Pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                        <th className="text-left py-3 px-4">Event Name</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Guests</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventHistory.map((event) => (
                        <tr key={event.id} className="border-b border-secondary-tea">
                          <td className="py-3 px-4">{event.id}</td>
                          <td className="py-3 px-4">{event.name}</td>
                          <td className="py-3 px-4">{event.date}</td>
                          <td className="py-3 px-4">{event.guests}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              event.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : event.status === 'Pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {event.status}
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
    </div>
  );
};

export default Profile;