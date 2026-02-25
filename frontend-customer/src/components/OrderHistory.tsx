import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { getMyOrders, cancelOrder } from '../services/orderService';
import { Order } from '../services/orderService';
import OrderDetails from './OrderDetails';
import ReorderButton from './ReorderButton';

interface OrderHistoryProps {
  userId?: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, filterStatus, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getMyOrders();
      setOrders(ordersData);
    } catch (err) {
      setError('Failed to load order history');
      toast.error('Failed to load order history');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const updatedOrder = await cancelOrder(orderId);
        
        // Update the order in our local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? updatedOrder : order
          )
        );
        
        toast.success('Order cancelled successfully');
      } catch (error) {
        console.error('Error cancelling order:', error);
        toast.error('Failed to cancel order');
      }
    }
  };

  const filterAndSortOrders = () => {
    let result = [...orders];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
      }
    });
    
    setFilteredOrders(result);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-primary-tea text-cream';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === 'delivery' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-tea rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-secondary-tea rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-heading font-semibold mb-2">Error Loading Orders</h3>
        <p className="text-secondary-tea mb-4">{error}</p>
        <button 
          onClick={fetchOrders}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-secondary-tea">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-heading font-semibold text-primary-tea">Order History</h2>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort Controls */}
            <div className="flex gap-1 sm:gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'total')}
                className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              >
                <option value="date">Sort by Date</option>
                <option value="total">Sort by Amount</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-secondary-tea rounded-md hover:bg-light-tea transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-2 bg-primary-tea text-cream rounded-md hover:bg-dark-tea transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-secondary-tea">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="p-3 sm:p-4 hover:bg-light-tea transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className="font-mono text-xs sm:text-sm font-medium">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-secondary-tea">
                      {getOrderTypeIcon(order.orderType)}
                      <span className="capitalize">{order.orderType}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-secondary-tea mb-2">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span><span className="font-medium">{order.items.length}</span> items</span>
                    <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  
                  {/* Items Preview */}
                  <div className="mt-2 text-sm text-secondary-tea">
                    {order.items.slice(0, 2).map((item: any, index: number) => (
                      <span key={index}>
                        {item.menuItem?.name} × {item.quantity}
                        {index < Math.min(2, order.items.length) - 1 && ', '}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span> + {order.items.length - 2} more</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col xs:flex-row gap-2">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="px-3 py-2 border border-primary-tea text-primary-tea rounded-md hover:bg-primary-tea hover:text-cream transition-colors text-xs sm:text-sm"
                  >
                    View Details
                  </button>
                  
                  {/* Cancel Order Button - only show for pending orders */}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors text-xs sm:text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                  
                  <ReorderButton 
                    order={order}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-secondary-tea mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="text-xl font-heading font-semibold mb-2">No Orders Found</h3>
              <p className="text-secondary-tea mb-4">
                {filterStatus !== 'all' 
                  ? 'No orders match your current filter.' 
                  : 'You haven\'t placed any orders yet.'}
              </p>
              {filterStatus !== 'all' && (
                <button 
                  onClick={() => setFilterStatus('all')}
                  className="text-primary-tea hover:text-accent-tea"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {orders.length > 0 && (
        <div className="p-4 border-t border-secondary-tea bg-cream">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>Total Orders: <span className="font-semibold">{orders.length}</span></div>
            <div>Showing: <span className="font-semibold">{filteredOrders.length}</span></div>
            <div>Delivered: <span className="font-semibold text-primary-tea">{orders.filter(o => o.status === 'delivered').length}</span></div>
            <div>Pending: <span className="font-semibold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</span></div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default OrderHistory;