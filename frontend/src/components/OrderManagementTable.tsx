import React, { useState } from 'react';
import { format } from 'date-fns';
import { Order } from '../services/orderService';
import { useToast } from '../context/ToastContext';

interface OrderManagementTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onRefresh: () => void;
}

const OrderManagementTable: React.FC<OrderManagementTableProps> = ({ 
  orders, 
  onUpdateStatus,
  onRefresh 
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const toast = useToast();

  // Filter orders
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
    }
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await onUpdateStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      {/* Filters and Controls */}
      <div className="p-4 border-b border-secondary-tea">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-heading font-semibold text-primary-tea">Order Management</h2>
          
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'total')}
                className="px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
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
              onClick={onRefresh}
              className="px-3 py-2 bg-primary-tea text-cream rounded-md hover:bg-dark-tea transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cream">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Order ID</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Items</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Payment</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-dark-tea">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <tr key={order._id} className="border-b border-secondary-tea hover:bg-light-tea">
                  <td className="py-3 px-4 font-mono text-sm">
                    <span className="font-medium">#{order._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{order.user.firstName} {order.user.lastName}</div>
                      <div className="text-sm text-secondary-tea">{order.user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {order.items.slice(0, 2).map((item: any, index: number) => (
                        <div key={index}>{item.menuItem?.name} × {item.quantity}</div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-secondary-tea">+{order.items.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {getOrderTypeIcon(order.orderType)}
                      <span className="capitalize">{order.orderType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-secondary-tea">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-tea hover:text-accent-tea text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-secondary-tea">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-secondary-tea mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p>No orders found</p>
                    {filterStatus !== 'all' && (
                      <button 
                        onClick={() => setFilterStatus('all')}
                        className="mt-2 text-primary-tea hover:text-accent-tea"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-secondary-tea bg-cream">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>Total Orders: <span className="font-semibold">{orders.length}</span></div>
          <div>Filtered: <span className="font-semibold">{filteredOrders.length}</span></div>
          <div>Pending: <span className="font-semibold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</span></div>
          <div>Today: <span className="font-semibold">{orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</span></div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementTable;