import React, { useState, useEffect } from 'react';
import { getMyOrders, Order as OrderType } from '../services/orderService';
import { format } from 'date-fns';

interface ExtendedOrder extends OrderType {
  updatedAt: string;
  deliveryFee?: number;
  tax?: number;
  size?: string;
  customizations?: Record<string, any>;
  notes?: string;
}

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }
      
      const ordersData = await getMyOrders();
      setOrders(ordersData);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in.');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSpecificOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    const foundOrder = orders.find(order => 
      order._id.includes(orderId) || order._id.slice(-6).toUpperCase().includes(orderId.toUpperCase())
    );
    
    if (foundOrder) {
      setSelectedOrder(foundOrder);
    } else {
      setError('Order not found.');
    }
  };

  const handleSelectOrder = (order: ExtendedOrder) => {
    setSelectedOrder(order);
  };

  const clearSelection = () => {
    setSelectedOrder(null);
    setError('');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-purple-500',
      ready: 'bg-indigo-500',
      delivered: 'bg-primary-tea',
      cancelled: 'bg-red-500'
    };
    return colors[status.toLowerCase()] || 'bg-gray-400';
  };

  const getOrderProgress = (order: ExtendedOrder) => {
    const stages = [
      { key: 'pending', label: 'Received', icon: '✓' },
      { key: 'confirmed', label: 'Confirmed', icon: '✓' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
      { key: 'ready', label: order.orderType === 'pickup' ? 'Ready' : 'Dispatched', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    const statusMap: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      preparing: 2,
      ready: 3,
      delivered: 4,
      cancelled: -1
    };

    const currentIndex = statusMap[order.status] ?? 0;
    const progress = Math.max(0, (currentIndex / (stages.length - 1)) * 100);

    return { stages, currentIndex, progress };
  };

  const renderProgressBar = (order: ExtendedOrder) => {
    const { stages, currentIndex, progress } = getOrderProgress(order);

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          {stages.map((stage, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={stage.key} className="flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                  isActive ? getStatusColor(order.status) : 'bg-gray-300'
                } ${isCurrent ? 'ring-4 ring-opacity-50 ring-primary-tea scale-110' : ''}`}>
                  {isActive ? stage.icon : index + 1}
                </div>
                <span className={`text-xs mt-2 font-medium text-center w-20 ${
                  isActive ? 'text-dark-tea' : 'text-gray-400'
                }`}>
                  {stage.label}
                </span>
                
                {index < stages.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-1 translate-x-1/2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${getStatusColor(order.status)}`}
                        style={{ width: `${Math.min(progress, (index / (stages.length - 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor(order.status)}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'cancelled' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-primary-tea bg-opacity-10 text-primary-tea'
          }`}>
            {order.status === 'delivered' ? 'Order Completed' : 
             order.status === 'cancelled' ? 'Order Cancelled' : 
             `Current Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-tea border-t-transparent mx-auto mb-4"></div>
          <p className="text-secondary-tea font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={clearSelection}
              className="flex items-center text-primary-tea hover:text-dark-tea transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Orders
            </button>
            <h1 className="text-3xl font-heading font-bold text-primary-tea">Order Tracking</h1>
            <div></div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-secondary-tea">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-dark-tea">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-secondary-tea mt-1">
                    Placed on {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full font-medium capitalize ${
                    selectedOrder.status === 'delivered' ? 'bg-primary-tea text-cream' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                  <div className="mt-2 text-right">
                    <span className="text-2xl font-bold text-primary-tea">
                      ${(selectedOrder.totalAmount + (selectedOrder.deliveryFee || 0) + (selectedOrder.tax || 0)).toFixed(2)}
                    </span>
                    <p className="text-sm text-secondary-tea capitalize">{selectedOrder.orderType} order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-secondary-tea">
              <h3 className="text-xl font-heading font-semibold mb-6 text-dark-tea">Order Progress</h3>
              {renderProgressBar(selectedOrder)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-tea">
                  <h3 className="text-xl font-heading font-semibold mb-6 text-dark-tea flex items-center">
                    <svg className="w-6 h-6 mr-3 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, index: number) => {
                      const itemName = item.menuItem?.name || item.name || item.title || `Item ${index + 1}`;
                      
                      return (
                        <div key={item._id || index} className="flex items-center p-4 bg-light-tea rounded-xl hover:shadow-md transition-all duration-200 group">
                          {/* Product Image */}
                          {item.menuItem?.image && (
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden mr-4">
                              <img 
                                src={item.menuItem.image} 
                                alt={itemName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = '/placeholder-image.jpg'; // fallback image
                                }}
                              />
                            </div>
                          )}
                          
                          {!item.menuItem?.image && (
                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-tea to-dark-tea rounded-xl flex items-center justify-center mr-4">
                              <svg className="w-8 h-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg text-dark-tea truncate group-hover:text-primary-tea transition-colors">
                              {itemName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-sm bg-secondary-tea bg-opacity-10 text-secondary-tea px-3 py-1 rounded-full font-medium">
                                Qty: {item.quantity}
                              </span>
                              {item.size && (
                                <span className="text-xs bg-primary-tea bg-opacity-10 text-primary-tea px-2 py-1 rounded-full">
                                  {item.size}
                                </span>
                              )}
                              {item.notes && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full truncate max-w-[100px]" 
                                      title={item.notes}>
                                  Note
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-dark-tea">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-secondary-tea">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-secondary-tea h-fit">
                <h3 className="text-xl font-heading font-semibold mb-6 text-dark-tea flex items-center">
                  <svg className="w-6 h-6 mr-3 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">Subtotal</span>
                    <span className="font-medium">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-tea">
                      {selectedOrder.orderType === 'delivery' ? 'Delivery Fee' : 'Pickup'}
                    </span>
                    <span className="font-medium">
                      ${selectedOrder.deliveryFee ? selectedOrder.deliveryFee.toFixed(2) : (selectedOrder.orderType === 'delivery' ? '5.00' : '0.00')}
                    </span>
                  </div>
                  
                  {selectedOrder.tax && (
                    <div className="flex justify-between">
                      <span className="text-secondary-tea">Tax</span>
                      <span className="font-medium">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-secondary-tea pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-dark-tea">Total</span>
                      <span className="text-primary-tea">
                        ${(selectedOrder.totalAmount + (selectedOrder.deliveryFee || 0) + (selectedOrder.tax || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-heading font-bold mb-10 text-center text-primary-tea">Order Tracking</h1>
        
        {/* Search Section */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8 border border-secondary-tea">
          <h2 className="text-xl font-heading font-semibold mb-4 text-dark-tea">Find Your Order</h2>
          <form onSubmit={handleTrackSpecificOrder} className="flex gap-3">
            <div className="flex-grow">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter order ID"
                className="w-full px-4 py-3 border border-secondary-tea rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-primary-tea to-dark-tea text-cream rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Track
            </button>
          </form>
          {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
        </div>

        {/* Orders List */}
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-heading font-semibold text-dark-tea">Your Recent Orders</h2>
            <button 
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2 bg-primary-tea text-cream rounded-xl hover:bg-dark-tea transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="bg-white rounded-xl p-5 border border-secondary-tea hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleSelectOrder(order)}
                >
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <h3 className="font-mono font-bold text-lg text-dark-tea group-hover:text-primary-tea transition-colors">
                        #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-secondary-tea text-sm mt-1">
                        {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                      <div className="text-right">
                        <span className="text-xl font-bold text-dark-tea">${order.totalAmount.toFixed(2)}</span>
                        <p className="text-sm text-secondary-tea capitalize">{order.orderType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        order.status === 'delivered' ? 'bg-primary-tea text-cream' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                      <svg className="w-5 h-5 text-secondary-tea group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-secondary-tea">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary-tea">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="font-medium text-primary-tea">Click to track →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-secondary-tea">
              <div className="w-24 h-24 bg-light-tea rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-secondary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3 text-dark-tea">No Orders Yet</h3>
              <p className="text-secondary-tea max-w-md mx-auto">
                You haven't placed any orders yet. Once you place an order, you'll be able to track it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;