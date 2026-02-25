import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PaymentMethodForm from '../components/PaymentMethodForm';
import MenuItemForm from '../components/MenuItemForm';
import HomePageContentEditor from '../components/HomePageContentEditor';
import SalesChart from '../components/SalesChart';
import CategoryChart from '../components/CategoryChart';
import ThemeToggle from '../components/ThemeToggle';
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
  deleteOrder,
  Order
} from '../services/orderService';
import { MenuItem as MenuItemType } from '../types/menu';
import { 
  getAllHomePageContent,
  createOrUpdateHomePageContent,
  HomePageContent
} from '../services/homeContentService';
import { 
  getAnalyticsData,
  AnalyticsData
} from '../services/analyticsService';
import { getEvents, Event } from '../services/eventService';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Verify admin authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.log('AdminDashboard: No authentication found, redirecting to admin login');
      window.location.href = '/admin-login';
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        console.log('AdminDashboard: Non-admin user detected, redirecting to home');
        window.location.href = '/';
        return;
      }
      console.log('AdminDashboard: Authentication verified for admin user:', user.email);
    } catch (error) {
      console.error('AdminDashboard: Error parsing user data, redirecting to admin login');
      window.location.href = '/admin-login';
    }
  }, []);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [showHomePageEditor, setShowHomePageEditor] = useState(false);
  const [editingHomePageSection, setEditingHomePageSection] = useState<string | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemType | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [homePageContent, setHomePageContent] = useState<HomePageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this item?'
  });
  const [successModalConfig, setSuccessModalConfig] = useState({
    title: 'Success',
    message: ''
  });
  const [warningModalConfig, setWarningModalConfig] = useState({
    title: 'Warning',
    message: ''
  });
  const [warningAction, setWarningAction] = useState<(() => void) | null>(null);
  
  // Menu Management Search and Filter State
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('all');
  const [menuFilterAvailability, setMenuFilterAvailability] = useState('all');
  const navigate = useNavigate();
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalCustomers: 0
  });

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
        } else if (activeTab === 'homepage') {
          const homeContent = await getAllHomePageContent();
          setHomePageContent(homeContent);
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

  // Fetch overview data (orders and events)
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Fetch recent orders
        const orderData = await getOrders();
        const sortedOrders = orderData
          .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentOrders(sortedOrders);
        
        // Calculate stats
        const totalRevenue = orderData.reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orderData.filter((order: Order) => order.status === 'pending').length;
        const uniqueCustomers = new Set(orderData.map((order: Order) => order.user?.email)).size;
        
        setStats({
          totalOrders: orderData.length,
          totalRevenue,
          pendingOrders,
          totalCustomers: uniqueCustomers
        });
        
        // Fetch upcoming events
        const eventData = await getEvents();
        const upcomingEvents = eventData
          .filter((event: Event) => new Date(event.eventDate) >= new Date())
          .sort((a: Event, b: Event) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 5);
        setRecentEvents(upcomingEvents);
        
      } catch (err) {
        console.error('Error fetching overview data:', err);
      }
    };

    fetchOverviewData();
  }, []);

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleDeletePaymentMethod = async (id: string) => {
    setDeleteModalConfig({
      title: 'Delete Payment Method',
      message: 'Are you sure you want to delete this payment method? This action cannot be undone.'
    });
    setDeleteAction(() => async () => {
      try {
        await deletePaymentMethod(id);
        setPaymentMethods(paymentMethods.filter(method => method._id !== id));
      } catch (err) {
        console.error('Error deleting payment method:', err);
        
        // Show error modal
        setWarningModalConfig({
          title: 'Error',
          message: 'Failed to delete payment method. Please try again.'
        });
        setShowWarningModal(true);
      }
    });
    setShowDeleteModal(true);
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
      
      // Show error modal
      setWarningModalConfig({
        title: 'Error',
        message: 'Failed to save payment method. Please try again.'
      });
      setShowWarningModal(true);
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
      
      // Show error modal
      setWarningModalConfig({
        title: 'Error',
        message: 'Failed to update payment method status. Please try again.'
      });
      setShowWarningModal(true);
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
    setDeleteModalConfig({
      title: 'Delete Menu Item',
      message: 'Are you sure you want to delete this menu item? This action cannot be undone.'
    });
    setDeleteAction(() => async () => {
      try {
        await deleteMenuItem(id);
        setMenuItems(menuItems.filter(item => item.id !== id));
        // Refresh menu items to ensure client side updates
        const updatedMenuData = await getMenuItems();
        setMenuItems(updatedMenuData);
      } catch (err) {
        console.error('Error deleting menu item:', err);
        
        // Show error modal
        setWarningModalConfig({
          title: 'Error',
          message: 'Failed to delete menu item. Please try again.'
        });
        setShowWarningModal(true);
      }
    });
    setShowDeleteModal(true);
  };

  const toggleMenuItemAvailability = async (item: MenuItemType) => {
    console.log('Toggling availability for item:', item);
    try {
      console.log('Sending update request for item ID:', item.id);
      const updatedItem = await updateMenuItem(item.id || '', { 
        available: !item.available 
      });
      console.log('Received updated item:', updatedItem);
      
      // Update the local state
      setMenuItems(menuItems.map(menuItem => 
        menuItem.id === item.id ? { ...menuItem, available: updatedItem.available } : menuItem
      ));
      
      // Also update the editing item if it's the same one
      if (editingMenuItem && editingMenuItem.id === item.id) {
        setEditingMenuItem({ ...editingMenuItem, available: updatedItem.available });
      }
      
      console.log('Successfully updated menu item availability');
    } catch (err) {
      console.error('Error toggling menu item availability:', err);
      
      // Show error modal
      setWarningModalConfig({
        title: 'Error',
        message: 'Failed to update menu item availability. Please try again.'
      });
      setShowWarningModal(true);
    }
  };

  const handleSaveMenuItem = async (item: Partial<MenuItemType>) => {
    try {
      let savedItem: MenuItemType;
      
      if (editingMenuItem && editingMenuItem.id) {
        // Update existing
        savedItem = await updateMenuItem(editingMenuItem.id, item);
        setMenuItems(menuItems.map(m => m.id === editingMenuItem.id ? savedItem : m));
      } else {
        // Add new - ensure required fields are present
        if (!item.name || !item.price || !item.category) {
          throw new Error('Required fields are missing');
        }
        savedItem = await createMenuItem(item);
        setMenuItems([...menuItems, savedItem]);
      }
      
      setShowMenuItemModal(false);
      setEditingMenuItem(null);
      
      // Refresh menu items to ensure both client and admin sides are updated
      const updatedMenuData = await getMenuItems();
      setMenuItems(updatedMenuData);
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to save menu item. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error modal
      setWarningModalConfig({
        title: 'Error',
        message: errorMessage
      });
      setShowWarningModal(true);
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
      
      // Show success modal
      setSuccessModalConfig({
        title: 'Success',
        message: 'Payment verified successfully!'
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error verifying payment:', err);
      
      // Show error modal
      setWarningModalConfig({
        title: 'Error',
        message: 'Failed to verify payment. Please try again.'
      });
      setShowWarningModal(true);
    }
  };

  const handleRejectPayment = (orderId: string) => {
    // Show warning modal for confirmation
    setWarningModalConfig({
      title: 'Reject Payment',
      message: 'Are you sure you want to reject this payment? This action cannot be undone.'
    });
    
    setWarningAction(() => async () => {
      try {
        const updatedOrder = await updatePaymentStatus(orderId, 'failed');
        // Update the orders state with the rejected order
        setOrders(orders.map(order => 
          order._id === orderId ? updatedOrder : order
        ));
        
        // Show success modal
        setSuccessModalConfig({
          title: 'Success',
          message: 'Payment rejected successfully!'
        });
        setShowSuccessModal(true);
      } catch (err) {
        console.error('Error rejecting payment:', err);
        
        // Show error modal
        setWarningModalConfig({
          title: 'Error',
          message: 'Failed to reject payment. Please try again.'
        });
        setShowWarningModal(true);
      }
    });
    
    setShowWarningModal(true);
  };

  const handleDeletePaymentProof = async (orderId: string) => {
    setDeleteModalConfig({
      title: 'Delete Payment Proof',
      message: 'Are you sure you want to delete this payment proof? This action cannot be undone and will permanently remove this record from the database.'
    });
    setDeleteAction(() => async () => {
      try {
        console.log('Attempting to delete order with ID:', orderId);
        
        // Call the delete API
        const response = await deleteOrder(orderId);
        console.log('Delete API response:', response);
        
        // Remove the order from state
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.filter(order => order._id !== orderId);
          console.log('Orders after filtering:', updatedOrders.length, 'remaining');
          return updatedOrders;
        });
        
        // Show success modal
        setSuccessModalConfig({
          title: 'Success',
          message: 'Item deleted successfully'
        });
        setShowSuccessModal(true);
        
        // Optionally refresh the data to ensure consistency
        if (activeTab === 'paymentProofs') {
          console.log('Refreshing orders data...');
          const updatedOrders = await getOrders();
          setOrders(updatedOrders);
          console.log('Orders refreshed, new count:', updatedOrders.length);
        }
      } catch (err: any) {
        console.error('Error deleting payment proof:', err);
        console.error('Full error object:', err);
        console.error('Error response:', err.response);
        
        let errorMessage = 'Failed to delete payment proof';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        console.error('Final error message:', errorMessage);
        // Show error modal
        setWarningModalConfig({
          title: 'Error',
          message: `Error: ${errorMessage}`
        });
        setShowWarningModal(true);
      }
    });
    setShowDeleteModal(true);
  };

  const handleLogout = () => {
    // Remove all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberAdmin');
    // Redirect to admin login page
    navigate('/admin/login');
  };

  // Event Handlers - Navigate to Admin Events page for event management
  const handleAddEvent = () => {
    navigate('/admin/events'); // Navigate to the AdminEvents page
  };

  const handleEditEvent = (event: any) => {
    navigate('/admin/events'); // Navigate to the AdminEvents page
  };

  // Load analytics data from database
  useEffect(() => {
    const loadAnalytics = async () => {
      if (activeTab === 'overview') {
        try {
          const data = await getAnalyticsData();
          setAnalyticsData(data);
        } catch (error) {
          console.error('Error loading analytics:', error);
        }
      }
    };
    loadAnalytics();
  }, [activeTab]);

  // Group menu items by category for better display
  const getMenuItemsByCategory = () => {
    // First filter the menu items based on search and filters
    let filteredItems = [...menuItems];
    
    // Apply search filter
    if (menuSearchTerm) {
      const term = menuSearchTerm.toLowerCase().trim();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (menuFilterCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === menuFilterCategory);
    }
    
    // Apply availability filter
    if (menuFilterAvailability !== 'all') {
      const isAvailable = menuFilterAvailability === 'available';
      filteredItems = filteredItems.filter(item => item.available === isAvailable);
    }
    
    // Group by category
    const categories: Record<string, MenuItemType[]> = {};
    
    filteredItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    
    return categories;
  };

  const menuItemsByCategory = getMenuItemsByCategory();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary-tea">Admin Dashboard</h1>
          <div className="flex space-x-2 items-center">
            <ThemeToggle />
            <button 
              onClick={handleAddMenuItem}
              className="btn-secondary text-sm py-2 px-3"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Menu Item
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="btn-primary text-sm py-2 px-3"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Event
            </button>
          </div>
        </div>
        
        {/* Dashboard Overview Content */}
        <div>
          <div>
            {/* Real Analytics Stats */}
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-3 bg-light-tea rounded-xl mr-4 transition-all duration-300">
                      <svg className="w-8 h-8 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-tea text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                      <p className="text-3xl font-bold text-primary-tea mt-1">${analyticsData.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-3 bg-light-tea rounded-xl mr-4 transition-all duration-300">
                      <svg className="w-8 h-8 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-tea text-sm font-medium uppercase tracking-wide">Total Orders</p>
                      <p className="text-3xl font-bold text-accent-tea mt-1">{analyticsData.totalOrders}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-3 bg-light-tea rounded-xl mr-4 transition-all duration-300">
                      <svg className="w-8 h-8 text-dark-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-tea text-sm font-medium uppercase tracking-wide">Total Customers</p>
                      <p className="text-3xl font-bold text-dark-tea mt-1">{analyticsData.totalCustomers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-3 bg-light-tea rounded-xl mr-4 transition-all duration-300">
                      <svg className="w-8 h-8 text-dark-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-tea text-sm font-medium uppercase tracking-wide">Total Events</p>
                      <p className="text-3xl font-bold text-primary-tea mt-1">{analyticsData.totalEvents}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analytics Charts */}
            {analyticsData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <SalesChart 
                  data={analyticsData.revenueTrend} 
                  title="Monthly Revenue Trend" 
                  height={300}
                />
                <CategoryChart 
                  data={analyticsData.salesByCategory} 
                  title="Sales Distribution" 
                  height={300}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-4 shadow-lg shadow-secondary-tea/20 border border-secondary-tea/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-heading font-semibold text-dark-tea">Recent Orders</h2>
                  <button 
                    onClick={() => navigate('/orders')}
                    className="text-primary-tea hover:text-accent-tea transition-colors text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-cream dark:bg-gray-800 z-10">
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Order ID</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Customer</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Items</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Total</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="border-b border-secondary-tea hover:bg-light-tea hover:bg-opacity-30 transition-colors">
                          <td className="py-2 px-3 text-dark-tea">{order.orderId || order._id.slice(-6)}</td>
                          <td className="py-2 px-3 text-dark-tea">{order.user?.firstName} {order.user?.lastName}</td>
                          <td className="py-2 px-3 text-dark-tea">{order.items?.length || 0}</td>
                          <td className="py-2 px-3 text-dark-tea font-medium">${order.totalAmount?.toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : order.status === 'preparing' 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                  : order.status === 'ready'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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
              
              <div className="card p-4 shadow-lg shadow-secondary-tea/20 border border-secondary-tea/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-heading font-semibold text-dark-tea">Upcoming Events</h2>
                  <button 
                    onClick={() => navigate('/events')}
                    className="text-primary-tea hover:text-accent-tea transition-colors text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-cream dark:bg-gray-800 z-10">
                      <tr className="border-b border-secondary-tea">
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Event ID</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Event Name</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Customer</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Date</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Guests</th>
                        <th className="text-left py-2 px-3 text-dark-tea font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event) => (
                        <tr key={event._id} className="border-b border-secondary-tea hover:bg-light-tea hover:bg-opacity-30 transition-colors">
                          <td className="py-2 px-3 text-dark-tea">{event._id.slice(-6)}</td>
                          <td className="py-2 px-3 text-dark-tea font-medium">{event.eventType}</td>
                          <td className="py-2 px-3 text-dark-tea">{event.customer.firstName} {event.customer.lastName}</td>
                          <td className="py-2 px-3 text-dark-tea">{new Date(event.eventDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-dark-tea">{event.guestCount}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : event.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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
        </div>
        
        {/* Other tab contents - now accessed via navbar links instead of tabs */}
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
            
            {/* Search and Filter Controls */}
            <div className="mb-6 p-4 bg-light-tea rounded-lg">
              {/* Results Summary */}
              <div className="mb-4 text-center">
                <p className="text-dark-tea">
                  Showing <span className="font-semibold">{Object.values(menuItemsByCategory).flat().length}</span> of <span className="font-semibold">{menuItems.length}</span> menu items
                  {(menuSearchTerm || menuFilterCategory !== 'all' || menuFilterAvailability !== 'all') && (
                    <span> (filters applied)</span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-dark-tea mb-1">Search Items</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, description, or category..."
                      className="w-full px-3 py-2 pl-10 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                    />
                    <svg 
                      className="absolute left-3 top-2.5 h-5 w-5 text-secondary-tea" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    value={menuFilterCategory}
                    onChange={(e) => setMenuFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="drinks">Drinks</option>
                    <option value="food">Food</option>
                  </select>
                </div>
                
                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-1">Availability</label>
                  <select
                    className="w-full px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    value={menuFilterAvailability}
                    onChange={(e) => setMenuFilterAvailability(e.target.value)}
                  >
                    <option value="all">All Items</option>
                    <option value="available">Available Only</option>
                    <option value="unavailable">Unavailable Only</option>
                  </select>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              {(menuSearchTerm || menuFilterCategory !== 'all' || menuFilterAvailability !== 'all') && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => {
                      setMenuSearchTerm('');
                      setMenuFilterCategory('all');
                      setMenuFilterAvailability('all');
                    }}
                    className="text-sm text-primary-tea hover:text-accent-tea underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
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
                {Object.entries(menuItemsByCategory).map(([category, items]) => {
                  // Limit items displayed per category
                  const itemsToShow = 10;
                  const displayItems = items.slice(0, itemsToShow);
                  const hasMoreItems = items.length > itemsToShow;
                  
                  return (
                    <div key={category} className="border border-secondary-tea rounded-lg">
                      <div className="bg-light-tea p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="text-lg font-heading font-semibold capitalize">{category}</h3>
                        {hasMoreItems && (
                          <span className="text-sm text-secondary-tea">
                            Showing {itemsToShow} of {items.length} items
                          </span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-cream z-10">
                            <tr className="border-b border-secondary-tea">
                              <th className="text-left py-2 px-3">Item Name</th>
                              <th className="text-left py-2 px-3">Price</th>
                              <th className="text-left py-2 px-3">Description</th>
                              <th className="text-left py-2 px-3">Availability</th>
                              <th className="text-left py-2 px-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayItems.map((item) => (
                              <tr key={item.id} className="border-b border-secondary-tea hover:bg-light-tea">
                                <td className="py-2 px-3 font-medium">{item.name}</td>
                                <td className="py-2 px-3">${item.price.toFixed(2)}</td>
                                <td className="py-2 px-3 max-w-xs truncate">{item.description}</td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                    <button 
                                      onClick={() => toggleMenuItemAvailability(item)}
                                      className={`text-xs px-2 py-1 rounded ${
                                        item.available 
                                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                                      }`}
                                    >
                                      {item.available ? 'Make Unavailable' : 'Make Available'}
                                    </button>
                                  </div>
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
                        
                        {hasMoreItems && (
                          <div className="p-3 bg-light-tea text-center border-t border-secondary-tea">
                            <p className="text-sm text-secondary-tea mb-2">
                              {items.length - itemsToShow} more items available. Use search or filters to find specific items.
                            </p>
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => setMenuFilterCategory(category)}
                                className="text-xs bg-primary-tea text-cream px-3 py-1 rounded hover:bg-accent-tea transition-colors"
                              >
                                Filter by {category}
                              </button>
                              <button 
                                onClick={() => {
                                  setMenuFilterCategory(category);
                                  setMenuFilterAvailability('all');
                                  setMenuSearchTerm('');
                                }}
                                className="text-xs border border-primary-tea text-primary-tea px-3 py-1 rounded hover:bg-primary-tea hover:text-cream transition-colors"
                              >
                                View All {category.charAt(0).toUpperCase() + category.slice(1)}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
        
        {activeTab === 'users' && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold">User Management</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="btn-primary text-sm py-2 px-3"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Manage Users
                </button>
                <button 
                  onClick={() => navigate('/admin/profile')}
                  className="btn-secondary text-sm py-2 px-3"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Admin Profile
                </button>
              </div>
            </div>
            
            <div className="bg-light-tea rounded-lg p-6 text-center">
              <svg className="w-16 h-16 mx-auto text-primary-tea mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <h3 className="text-xl font-heading font-semibold text-dark-tea mb-2">Complete User Management</h3>
              <p className="text-secondary-tea mb-4">Manage all users, create new accounts, and assign roles from the dedicated user management page.</p>
              <button 
                onClick={() => navigate('/admin/users')}
                className="btn-primary"
              >
                Go to User Management
              </button>
            </div>
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
                            {order.user ? (
                              <>
                                {order.user.firstName} {order.user.lastName}
                                <br />
                                <span className="text-xs text-secondary-tea">{order.user.email}</span>
                              </>
                            ) : (
                              <span className="text-xs text-secondary-tea">Unknown User</span>
                            )}
                          </td>                          <td className="py-2 px-3">${order.totalAmount.toFixed(2)}</td>
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
                            <div className="flex space-x-2">
                              {order.paymentStatus === 'pending' ? (
                                <>
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
                                </>
                              ) : order.paymentStatus === 'paid' ? (
                                <span className="text-xs text-green-600">Verified</span>
                              ) : (
                                <span className="text-xs text-red-600">Rejected</span>
                              )}
                              <button
                                onClick={() => handleDeletePaymentProof(order._id)}
                                className="text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-1 rounded flex items-center"
                                title="Delete Payment Proof"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
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

        {activeTab === 'homepage' && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold">Homepage Content Management</h2>
              <p className="text-sm text-secondary-tea">Manage content displayed on the homepage</p>
            </div>
            
            {loading ? (
              <div className="text-center py-6">
                <p>Loading homepage content...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Hero Section</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage the main hero section content on the homepage</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('hero');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Hero Content
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Features Section</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage the features/services section content</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('features');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Features Content
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Menu Highlights</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage the featured menu items section</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('menuHighlights');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Menu Highlights
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Gallery Section</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage the gallery/images section</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('gallery');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Gallery Content
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Catering Section</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage catering services section</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('catering');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Catering Content
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Testimonials</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage customer testimonials section</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('testimonials');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Testimonials
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Newsletter</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage newsletter subscription section</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('newsletter');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Newsletter Content
                    </button>
                  </div>
                </div>
                
                <div className="border border-secondary-tea rounded-lg">
                  <div className="bg-light-tea p-3 rounded-t-lg">
                    <h3 className="text-lg font-heading font-semibold">Footer Content</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-dark-tea mb-4">Manage footer content including social links, contact info, and opening hours</p>
                    <button 
                      onClick={() => {
                        setEditingHomePageSection('footer');
                        setShowHomePageEditor(true);
                      }}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Edit Footer Content
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-heading font-semibold text-primary-tea">
                  {editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
              </div>
              
              <div className="pr-2">
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
        </div>
      )}

      {/* Menu Item Modal */}
      {showMenuItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-heading font-semibold text-primary-tea">
                  {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
              </div>
              
              <div className="pr-2">
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
        </div>
      )}



      {/* Homepage Content Editor Modal */}
      {showHomePageEditor && editingHomePageSection && (
        <HomePageContentEditor
          section={editingHomePageSection}
          onClose={() => {
            setShowHomePageEditor(false);
            setEditingHomePageSection(null);
          }}
          onSave={() => {
            // Refresh homepage content after saving
            if (activeTab === 'homepage') {
              const fetchData = async () => {
                try {
                  setLoading(true);
                  const homeContent = await getAllHomePageContent();
                  setHomePageContent(homeContent);
                } catch (err) {
                  console.error('Error refreshing homepage content:', err);
                  setError('Failed to refresh homepage content');
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }
          }}
        />
      )}
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAction || (() => {})}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        iconType="warning"
      />
      
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title={successModalConfig.title}
        message={successModalConfig.message}
        confirmText="OK"
        confirmButtonClass="bg-primary-tea hover:bg-accent-tea"
        cancelText=""
        iconType="success"
      />
      
      <ConfirmModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={warningAction || (() => {})}
        title={warningModalConfig.title}
        message={warningModalConfig.message}
        confirmText="Confirm"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        cancelText="Cancel"
        iconType="warning"
      />
    </div>
  );
};

export default AdminDashboard;