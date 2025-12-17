import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PaymentMethodForm from '../components/PaymentMethodForm';
import MenuItemForm from '../components/MenuItemForm';
import { 
  getAllPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  PaymentMethod 
} from '../services/paymentService';
import { 
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../services/menuService';
import { 
  getOrders,
  updatePaymentStatus,
  Order
} from '../services/orderService';
import { MenuItem as MenuItemType } from '../types/menu';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemType | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
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

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'payments') {
          const paymentData = await getAllPaymentMethods();
          setPaymentMethods(paymentData);
        } else if (activeTab === 'menu') {
          const menuData = await getMenuItems();
          setMenuItems(menuData);
        } else if (activeTab === 'paymentProofs') {
          const orderData = await getOrders();
          setOrders(orderData);
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
        setError(`Failed to load ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Menu Item Handlers
  const handleAddMenuItem = () => {
    setEditingMenuItem(null);
    setShowMenuItemModal(true);
  };

  const handleEditMenuItem = (item: MenuItemType) => {
    setEditingMenuItem(item);
    setShowMenuItemModal(true);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(id);
        setMenuItems(menuItems.filter(item => item.id !== id));
        // Refresh menu items to ensure client side updates
        const updatedMenuData = await getMenuItems();
        setMenuItems(updatedMenuData);
      } catch (err) {
        console.error('Error deleting menu item:', err);
        alert('Failed to delete menu item');
      }
    }
  };

  const handleSaveMenuItem = async (item: MenuItemType) => {
    try {
      let savedItem: MenuItemType;
      
      if (editingMenuItem && editingMenuItem.id) {
        // Update existing
        savedItem = await updateMenuItem(editingMenuItem.id, item);
        setMenuItems(menuItems.map(m => m.id === editingMenuItem.id ? savedItem : m));
      } else {
        // Add new
        savedItem = await createMenuItem(item);
        setMenuItems([...menuItems, savedItem]);
      }
      
      setShowMenuItemModal(false);
      setEditingMenuItem(null);
      
      // Refresh menu items to ensure both client and admin sides are updated
      const updatedMenuData = await getMenuItems();
      setMenuItems(updatedMenuData);
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert('Failed to save menu item');
    }
  };

  // Payment Verification Handlers
  const handleVerifyPayment = async (orderId: string) => {
    try {
      const updatedOrder = await updatePaymentStatus(orderId, 'paid');
      // Update the orders state with the verified order
      setOrders(orders.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
      alert('Payment verified successfully!');
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Failed to verify payment');
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    try {
      const updatedOrder = await updatePaymentStatus(orderId, 'failed');
      // Update the orders state with the rejected order
      setOrders(orders.map(order => 
        order._id === orderId ? updatedOrder : order
      ));
      alert('Payment rejected successfully!');
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Failed to reject payment');
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  // Group menu items by category for better display
  const getMenuItemsByCategory = () => {
    const categories: Record<string, MenuItemType[]> = {};
    
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    
    return categories;
  };

  const menuItemsByCategory = getMenuItemsByCategory();

  return (
    <div className="min-h-screen bg-cream">
      {/* Admin Top Navigation */}
      <div className="bg-primary-tea text-cream py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-lg font-heading font-bold">Admin Panel</div>
          <div className="flex space-x-4">
            <Link to="/admin/profile" className="hover:text-cream hover:underline transition-all text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Admin Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="hover:text-cream hover:underline transition-all text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cream hover:underline transition-all text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Preview Site
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary-tea">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <button 
              onClick={handleAddMenuItem}
              className="btn-secondary text-sm py-2 px-3"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Menu Item
            </button>
            <button className="btn-primary text-sm py-2 px-3">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Event
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-6 border-b border-secondary-tea text-sm">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 font-medium flex items-center ${activeTab === 'overview' ? 'text-primary-tea border-b-2 border-primary-tea' : 'text-dark-tea'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-3 font-medium flex items-center ${activeTab === 'menu' ? 'text-primary-tea border-b-2 border-primary-tea' : 'text-dark-tea'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Menu Management
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3 font-medium flex items-center ${activeTab === 'payments' ? 'text-primary-tea border-b-2 border-primary-tea' : 'text-dark-tea'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Payment Methods
          </button>
          <button 
            onClick={() => setActiveTab('paymentProofs')}
            className={`py-2 px-3 font-medium flex items-center ${activeTab === 'paymentProofs' ? 'text-primary-tea border-b-2 border-primary-tea' : 'text-dark-tea'}`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Payment Proofs
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-tea bg-opacity-10 rounded-xl mr-4 transition-all duration-300 hover:bg-opacity-20">
                    <svg className="w-8 h-8 text-primary-tea transition-transform duration-300 transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea text-sm font-medium uppercase tracking-wide">Total Orders</p>
                    <p className="text-3xl font-bold text-primary-tea mt-1">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 bg-accent-tea bg-opacity-10 rounded-xl mr-4 transition-all duration-300 hover:bg-opacity-20">
                    <svg className="w-8 h-8 text-accent-tea transition-transform duration-300 transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                    <p className="text-3xl font-bold text-accent-tea mt-1">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 bg-secondary-tea bg-opacity-10 rounded-xl mr-4 transition-all duration-300 hover:bg-opacity-20">
                    <svg className="w-8 h-8 text-secondary-tea transition-transform duration-300 transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 10-18 0 9 9 0 0018 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea text-sm font-medium uppercase tracking-wide">Pending Orders</p>
                    <p className="text-3xl font-bold text-secondary-tea mt-1">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="p-3 bg-dark-tea bg-opacity-10 rounded-xl mr-4 transition-all duration-300 hover:bg-opacity-20">
                    <svg className="w-8 h-8 text-dark-tea transition-transform duration-300 transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-secondary-tea text-sm font-medium uppercase tracking-wide">Total Customers</p>
                    <p className="text-3xl font-bold text-dark-tea mt-1">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-heading font-semibold">Recent Orders</h2>
                  <button className="text-primary-tea hover:text-accent-tea transition-colors text-sm">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-2 px-3">Order ID</th>
                        <th className="text-left py-2 px-3">Customer</th>
                        <th className="text-left py-2 px-3">Items</th>
                        <th className="text-left py-2 px-3">Total</th>
                        <th className="text-left py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-secondary-tea">
                          <td className="py-2 px-3">{order.id}</td>
                          <td className="py-2 px-3">{order.customer}</td>
                          <td className="py-2 px-3">{order.items}</td>
                          <td className="py-2 px-3">${order.total.toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'Preparing' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-yellow-100 text-yellow-800'
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
              
              <div className="card p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-heading font-semibold">Upcoming Events</h2>
                  <button className="text-primary-tea hover:text-accent-tea transition-colors text-sm">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-2 px-3">Event ID</th>
                        <th className="text-left py-2 px-3">Event Name</th>
                        <th className="text-left py-2 px-3">Customer</th>
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-left py-2 px-3">Guests</th>
                        <th className="text-left py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event) => (
                        <tr key={event.id} className="border-b border-secondary-tea">
                          <td className="py-2 px-3">{event.id}</td>
                          <td className="py-2 px-3">{event.name}</td>
                          <td className="py-2 px-3">{event.customer}</td>
                          <td className="py-2 px-3">{event.date}</td>
                          <td className="py-2 px-3">{event.guests}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              event.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
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
            </div>
          </div>
        )}
        
        {activeTab === 'menu' && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold">Menu Management</h2>
              <button 
                onClick={handleAddMenuItem}
                className="btn-primary text-sm py-2 px-3"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Menu Item
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-6">
                <p>Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            ) : Object.keys(menuItemsByCategory).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(menuItemsByCategory).map(([category, items]) => (
                  <div key={category} className="border border-secondary-tea rounded-lg">
                    <div className="bg-light-tea p-3 rounded-t-lg">
                      <h3 className="text-lg font-heading font-semibold capitalize">{category}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-secondary-tea bg-cream">
                            <th className="text-left py-2 px-3">Item Name</th>
                            <th className="text-left py-2 px-3">Price</th>
                            <th className="text-left py-2 px-3">Description</th>
                            <th className="text-left py-2 px-3">Availability</th>
                            <th className="text-left py-2 px-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-b border-secondary-tea hover:bg-light-tea">
                              <td className="py-2 px-3 font-medium">{item.name}</td>
                              <td className="py-2 px-3">${item.price.toFixed(2)}</td>
                              <td className="py-2 px-3 max-w-xs truncate">{item.description}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.available ? 'Available' : 'Unavailable'}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleEditMenuItem(item)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMenuItem(item.id || '')}
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
            ) : (
              <div className="text-center py-8">
                <p className="text-dark-tea">No menu items found. Add your first menu item!</p>
                <button 
                  onClick={handleAddMenuItem}
                  className="btn-primary mt-4"
                >
                  Add Menu Item
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'payments' && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold">Payment Methods</h2>
              <button 
                onClick={() => {
                  setEditingPaymentMethod(null);
                  setShowPaymentModal(true);
                }}
                className="btn-primary text-sm py-2 px-3"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Payment Method
              </button>
            </div>
                    
            {loading ? (
              <div className="text-center py-6">
                <p>Loading payment methods...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-tea">
                      <th className="text-left py-2 px-3">Vendor</th>
                      <th className="text-left py-2 px-3">Account Name</th>
                      <th className="text-left py-2 px-3">Account Info</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.map((method) => (
                      <tr key={method._id} className="border-b border-secondary-tea">
                        <td className="py-2 px-3 font-medium">{method.vendor}</td>
                        <td className="py-2 px-3">{method.accountName}</td>
                        <td className="py-2 px-3">
                          {method.accountAlias || method.accountNumber || 'N/A'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            method.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {method.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => togglePaymentMethodStatus(method._id || '')}
                              className="text-xs text-primary-tea hover:text-accent-tea"
                            >
                              {method.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleEditPaymentMethod(method)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePaymentMethod(method._id || '')}
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
            )}
          </div>
        )}
        
        {activeTab === 'paymentProofs' && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold">Payment Proofs</h2>
              <p className="text-sm text-secondary-tea">View and verify submitted payment proofs</p>
            </div>
            
            {loading ? (
              <div className="text-center py-6">
                <p>Loading payment proofs...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-tea">
                      <th className="text-left py-2 px-3">Order ID</th>
                      <th className="text-left py-2 px-3">Customer</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Payment Method</th>
                      <th className="text-left py-2 px-3">Payment Status</th>
                      <th className="text-left py-2 px-3">Submitted Date</th>
                      <th className="text-left py-2 px-3">Proof</th>
                      <th className="text-left py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(order => order.paymentReceipt) // Only show orders with payment proofs
                      .map((order) => (
                        <tr key={order._id} className="border-b border-secondary-tea hover:bg-light-tea">
                          <td className="py-2 px-3 font-medium">{order.orderId || order._id.substring(0, 8)}</td>
                          <td className="py-2 px-3">
                            {order.user.firstName} {order.user.lastName}
                            <br />
                            <span className="text-xs text-secondary-tea">{order.user.email}</span>
                          </td>
                          <td className="py-2 px-3">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : order.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3">
                            {order.paymentReceipt ? (
                              <a 
                                href={order.paymentReceipt} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary-tea hover:text-accent-tea underline text-sm"
                              >
                                View Proof
                              </a>
                            ) : (
                              <span className="text-secondary-tea text-sm">No proof</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {order.paymentStatus === 'pending' ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleVerifyPayment(order._id)}
                                  className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(order._id)}
                                  className="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : order.paymentStatus === 'paid' ? (
                              <span className="text-xs text-green-600">Verified</span>
                            ) : (
                              <span className="text-xs text-red-600">Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                
                {orders.filter(order => order.paymentReceipt).length === 0 && (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-secondary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-dark-tea">No payment proofs submitted yet</p>
                    <p className="text-secondary-tea text-sm mt-1">Payment proofs will appear here when customers upload them during checkout</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-secondary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-dark-tea">No orders found</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-heading font-semibold text-primary-tea">
                  {editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPaymentMethod(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Menu Item Modal */}
      {showMenuItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-heading font-semibold text-primary-tea">
                  {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <button 
                  onClick={() => {
                    setShowMenuItemModal(false);
                    setEditingMenuItem(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
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
    </div>
  );
};

export default AdminDashboard;