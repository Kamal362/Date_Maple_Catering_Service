import React from 'react';

const AdminProfile: React.FC = () => {
  // In a real application, this data would come from context or API
  const adminData = {
    name: 'Admin User',
    email: 'admin@datemaple.com',
    role: 'Administrator',
    lastLogin: '2023-12-15 14:30:00',
    permissions: [
      'Manage Menu Items',
      'Manage Payment Methods',
      'View Orders',
      'Manage Users',
      'View Analytics'
    ]
  };

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
                <div className="w-24 h-24 bg-primary-tea rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-cream">
                    {adminData.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-2xl font-heading font-semibold text-dark-tea">{adminData.name}</h2>
                <p className="text-secondary-tea">{adminData.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-tea text-cream rounded-full text-sm">
                  {adminData.role}
                </span>
              </div>
              
              <div className="border-t border-secondary-tea pt-4">
                <h3 className="font-heading font-semibold text-lg mb-3">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Last Login:</span>
                    <span className="text-dark-tea">{adminData.lastLogin}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="w-full btn-secondary">
                  Edit Profile
                </button>
                <button className="w-full mt-3 btn-outline">
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
                {adminData.permissions.map((permission, index) => (
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
    </div>
  );
};

export default AdminProfile;