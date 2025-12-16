import React, { useState, useEffect } from 'react';
import PaymentMethodForm from '../components/PaymentMethodForm';
import { 
  getAllPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  PaymentMethod 
} from '../services/paymentService';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const stats = {
    totalOrders: 124,
    totalRevenue: 8450.75,
    pendingOrders: 8,
    totalCustomers: 342
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      items: 3,
      total: 24.50,
      status: 'Delivered',
      date: '2023-05-15'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      items: 2,
      total: 15.75,
      status: 'Preparing',
      date: '2023-05-15'
    },
    {
      id: 'ORD-003',
      customer: 'Robert Johnson',
      items: 5,
      total: 32.25,
      status: 'Pending',
      date: '2023-05-14'
    }
  ];

  const recentEvents = [
    {
      id: 'EV-001',
      name: 'Birthday Party',
      customer: 'Alice Brown',
      date: '2023-06-20',
      guests: 30,
      status: 'Confirmed'
    },
    {
      id: 'EV-002',
      name: 'Corporate Meeting',
      customer: 'Company Inc.',
      date: '2023-07-15',
      guests: 15,
      status: 'Pending'
    }
  ];

  // Fetch all payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const data = await getAllPaymentMethods();
        setPaymentMethods(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setError('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'payments') {
      fetchPaymentMethods();
    }
  }, [activeTab]);

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(id);
        setPaymentMethods(paymentMethods.filter(method => method._id !== id));
      } catch (err) {
        console.error('Error deleting payment method:', err);
        alert('Failed to delete payment method');
      }
    }
  };

  const handleSavePaymentMethod = async (method: PaymentMethod) => {
    try {
      if (editingPaymentMethod && editingPaymentMethod._id) {
        // Update existing
        const updatedMethod = await updatePaymentMethod(editingPaymentMethod._id, method);
        setPaymentMethods(paymentMethods.map(m => m._id === editingPaymentMethod._id ? updatedMethod : m));
      } else {
        // Add new
        const newMethod = await createPaymentMethod(method);
        setPaymentMethods([...paymentMethods, newMethod]);
      }
      setShowPaymentModal(false);
      setEditingPaymentMethod(null);
    } catch (err) {
      console.error('Error saving payment method:', err);
      alert('Failed to save payment method');
    }
  };

  const togglePaymentMethodStatus = async (id: string) => {
    try {
      const method = paymentMethods.find(m => m._id === id);
      if (method) {
        const updatedMethod = await updatePaymentMethod(id, { isActive: !method.isActive });
        setPaymentMethods(paymentMethods.map(m => 
          m._id === id ? updatedMethod : m
        ));
      }
    } catch (err) {
      console.error('Error toggling payment method status:', err);
      alert('Failed to update payment method status');
    }
  };

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-primary-tea">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button className="btn-secondary">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Menu Item
            </button>
            <button className="btn-primary">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Event
            </button>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-8 border-b border-secondary-tea">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-primary-tea border-b-2 border-primary-tea' : 'text-dark-tea'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-4 font-medium ${activeTab === 'payments' ? 'text-primary-tea border-b-2 border-primary-tea' : 'text-dark-tea'}`}
          >
            Payment Methods
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-tea bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-8 h-8 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-accent-tea bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-8 h-8 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-secondary-tea bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-8 h-8 text-secondary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 10-18 0 9 9 0 0018 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea">Pending Orders</p>
                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-dark-tea bg-opacity-10 rounded-lg mr-4">
                    <svg className="w-8 h-8 text-dark-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea">Total Customers</p>
                    <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-heading font-semibold">Recent Orders</h2>
                  <button className="text-primary-tea hover:text-accent-tea transition-colors">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Items</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-secondary-tea">
                          <td className="py-3 px-4">{order.id}</td>
                          <td className="py-3 px-4">{order.customer}</td>
                          <td className="py-3 px-4">{order.items}</td>
                          <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'Preparing' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                            }}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-heading font-semibold">Upcoming Events</h2>
                  <button className="text-primary-tea hover:text-accent-tea transition-colors">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-3 px-4">Event ID</th>
                        <th className="text-left py-3 px-4">Event Name</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Guests</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event) => (
                        <tr key={event.id} className="border-b border-secondary-tea">
                          <td className="py-3 px-4">{event.id}</td>
                          <td className="py-3 px-4">{event.name}</td>
                          <td className="py-3 px-4">{event.customer}</td>
                          <td className="py-3 px-4">{event.date}</td>
                          <td className="py-3 px-4">{event.guests}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              event.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }}`}>
                              {event.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'payments' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-semibold">Payment Methods</h2>
              <button 
                onClick={() => {
                  setEditingPaymentMethod(null);
                  setShowPaymentModal(true);
                }}
                className="btn-primary"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Payment Method
              </button>
            </div>
                    
            {loading ? (
              <div className="text-center py-8">
                <p>Loading payment methods...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-tea">
                      <th className="text-left py-3 px-4">Vendor</th>
                      <th className="text-left py-3 px-4">Account Name</th>
                      <th className="text-left py-3 px-4">Account Info</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.map((method) => (
                      <tr key={method._id} className="border-b border-secondary-tea">
                        <td className="py-3 px-4 font-medium">{method.vendor}</td>
                        <td className="py-3 px-4">{method.accountName}</td>
                        <td className="py-3 px-4">
                          {method.accountAlias || method.accountNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            method.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {method.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => togglePaymentMethodStatus(method._id || '')}
                              className="text-sm text-primary-tea hover:text-accent-tea"
                            >
                              {method.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleEditPaymentMethod(method)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePaymentMethod(method._id || '')}
                              className="text-sm text-red-600 hover:text-red-800"
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
            )}
          </div>
        )}
      </div>
      
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-heading font-semibold text-primary-tea">
                  {editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPaymentMethod(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <PaymentMethodForm 
                paymentMethod={editingPaymentMethod}
                onSave={handleSavePaymentMethod}
                onCancel={() => {
                  setShowPaymentModal(false);
                  setEditingPaymentMethod(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;