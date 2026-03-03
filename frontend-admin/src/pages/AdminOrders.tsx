import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder, Order } from '../services/orderService';
import ConfirmModal from '../components/ConfirmModal';
import { format } from 'date-fns';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-purple-100 text-purple-800 border-purple-200',
  ready:     'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_ICONS: Record<string, string> = {
  pending:   '🕐',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready:     '📦',
  delivered: '🚚',
  cancelled: '❌',
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('paid_only');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetOrder, setDeleteTargetOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    setSelectedOrder(order);
    setPendingStatus(newStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder || !pendingStatus) return;
    setUpdatingId(selectedOrder._id);
    try {
      await updateOrderStatus(selectedOrder._id, pendingStatus);
      setOrders(prev =>
        prev.map(o => o._id === selectedOrder._id ? { ...o, status: pendingStatus } : o)
      );
      showSuccess(`Order #${selectedOrder._id.slice(-6).toUpperCase()} updated to "${pendingStatus}"`);
      setShowStatusModal(false);
      // Update detail modal if open
      if (showDetailModal) {
        setSelectedOrder(prev => prev ? { ...prev, status: pendingStatus } : prev);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteClick = (order: Order) => {
    setDeleteTargetOrder(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetOrder) return;
    try {
      await deleteOrder(deleteTargetOrder._id);
      setOrders(prev => prev.filter(o => o._id !== deleteTargetOrder._id));
      showSuccess(`Order #${deleteTargetOrder._id.slice(-6).toUpperCase()} deleted`);
      setShowDeleteModal(false);
      if (showDetailModal && selectedOrder?._id === deleteTargetOrder._id) {
        setShowDetailModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order');
    }
  };

  const getNextStatus = (current: string): OrderStatus | null => {
    const idx = STATUS_FLOW.indexOf(current as OrderStatus);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const getCustomerName = (order: Order) => {
    if (order.isGuestOrder && order.guestInfo) {
      return `${order.guestInfo.firstName || ''} ${order.guestInfo.lastName || ''}`.trim() || 'Guest';
    }
    if (order.user?.firstName) {
      return `${order.user.firstName} ${order.user.lastName}`;
    }
    return 'Unknown';
  };

  const getCustomerEmail = (order: Order) => {
    if (order.isGuestOrder && order.guestInfo?.email) return order.guestInfo.email;
    return order.user?.email || '—';
  };

  const filteredOrders = orders.filter(order => {
    // Payment filter: by default show only paid orders
    if (filterStatus === 'paid_only') {
      if (order.paymentStatus !== 'paid') return false;
    } else if (filterStatus !== 'all') {
      if (order.status !== filterStatus) return false;
    }
    if (filterPayment !== 'all' && order.paymentStatus !== filterPayment) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const name = getCustomerName(order).toLowerCase();
      const email = getCustomerEmail(order).toLowerCase();
      const id = order._id.slice(-6).toLowerCase();
      return name.includes(q) || email.includes(q) || id.includes(q);
    }
    return true;
  });

  // Stats
  const approvedOrders = orders.filter(o => o.paymentStatus === 'paid');
  const activeOrders = approvedOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const completedOrders = orders.filter(o => o.transactionCompleted);

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary-tea">Order Management</h1>
            <p className="text-secondary-tea mt-1">Manage and track all customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-primary-tea text-cream px-4 py-2 rounded-lg hover:bg-dark-tea transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
            <button onClick={() => setError(null)} className="ml-auto">×</button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 border-l-4 border-primary-tea">
            <p className="text-sm text-secondary-tea">Total Orders</p>
            <p className="text-2xl font-bold text-primary-tea">{orders.length}</p>
          </div>
          <div className="card p-4 border-l-4 border-blue-500">
            <p className="text-sm text-blue-600">Active (Paid)</p>
            <p className="text-2xl font-bold text-blue-700">{activeOrders.length}</p>
          </div>
          <div className="card p-4 border-l-4 border-green-500">
            <p className="text-sm text-green-600">Delivered</p>
            <p className="text-2xl font-bold text-green-700">{deliveredOrders.length}</p>
          </div>
          <div className="card p-4 border-l-4 border-purple-500">
            <p className="text-sm text-purple-600">Completed</p>
            <p className="text-2xl font-bold text-purple-700">{completedOrders.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-dark-tea mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Order ID, customer name or email..."
                className="w-full px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-tea mb-1">Order Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream text-sm"
              >
                <option value="paid_only">Approved Payments (All Statuses)</option>
                <option value="all">All Orders</option>
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-tea mb-1">Payment</label>
              <select
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
                className="px-3 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream text-sm"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto mb-3" />
            <p className="text-secondary-tea">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 text-secondary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xl font-heading font-semibold text-dark-tea mb-2">No Orders Found</p>
            <p className="text-secondary-tea text-sm">Try changing the filters above.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-tea/20">
                  <tr className="border-b border-secondary-tea">
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Order</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Type</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Payment</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-dark-tea font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const nextStatus = getNextStatus(order.status);
                    const isUpdating = updatingId === order._id;
                    return (
                      <tr key={order._id} className="border-b border-secondary-tea hover:bg-light-tea/30 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                            className="font-mono font-bold text-primary-tea hover:text-dark-tea transition-colors"
                          >
                            #{order._id.slice(-6).toUpperCase()}
                          </button>
                          {order.transactionCompleted && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Completed</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-dark-tea">{getCustomerName(order)}</div>
                          {order.isGuestOrder && (
                            <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">Guest</span>
                          )}
                        </td>
                        <td className="py-3 px-4 capitalize text-dark-tea">{order.orderType}</td>
                        <td className="py-3 px-4 font-medium text-dark-tea">${order.totalAmount?.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {STATUS_ICONS[order.status]} {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-secondary-tea text-xs">
                          {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {/* Advance Status Button */}
                            {nextStatus && order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(order, nextStatus)}
                                disabled={isUpdating}
                                className="text-xs bg-primary-tea text-cream hover:bg-dark-tea px-2 py-1 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {isUpdating ? '...' : `→ ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                              </button>
                            )}
                            {/* Cancel Button (only active non-delivered) */}
                            {!['delivered', 'cancelled'].includes(order.status) && order.paymentStatus === 'paid' && (
                              <button
                                onClick={() => handleStatusChange(order, 'cancelled')}
                                disabled={isUpdating}
                                className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {/* Details Button */}
                            <button
                              onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                              className="text-xs bg-secondary-tea/20 text-dark-tea hover:bg-secondary-tea/40 px-2 py-1 rounded-lg transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-dark-tea">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-secondary-tea mt-0.5">
                    {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'MMMM d, yyyy • h:mm a') : ''}
                  </p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status + Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-secondary-tea uppercase tracking-wide mb-1">Order Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border inline-block ${STATUS_COLORS[selectedOrder.status] || ''}`}>
                      {STATUS_ICONS[selectedOrder.status]} {selectedOrder.status}
                    </span>
                    {selectedOrder.transactionCompleted && (
                      <div className="mt-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 border border-purple-200 font-medium">
                          ✓ Transaction Completed
                        </span>
                        {selectedOrder.completedAt && (
                          <p className="text-xs text-secondary-tea mt-1">
                            {format(new Date(selectedOrder.completedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-secondary-tea uppercase tracking-wide mb-1">Payment</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border inline-block ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                      selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {selectedOrder.paymentStatus || 'pending'}
                    </span>
                    <p className="text-xs text-secondary-tea mt-1 capitalize">{selectedOrder.paymentMethod?.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-secondary-tea uppercase tracking-wide mb-2">Customer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-tea rounded-full flex items-center justify-center text-cream font-bold text-lg">
                      {getCustomerName(selectedOrder).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-tea">{getCustomerName(selectedOrder)}</p>
                      <p className="text-sm text-secondary-tea">{getCustomerEmail(selectedOrder)}</p>
                      {selectedOrder.isGuestOrder && selectedOrder.guestInfo?.phone && (
                        <p className="text-sm text-secondary-tea">{selectedOrder.guestInfo.phone}</p>
                      )}
                    </div>
                    {selectedOrder.isGuestOrder && (
                      <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Guest Order</span>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-secondary-tea uppercase tracking-wide mb-2">
                    {selectedOrder.orderType === 'delivery' ? 'Delivery Address' : 'Pickup Time'}
                  </p>
                  {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress ? (
                    <p className="text-sm text-dark-tea">
                      {[selectedOrder.deliveryAddress.street, selectedOrder.deliveryAddress.city, selectedOrder.deliveryAddress.state, selectedOrder.deliveryAddress.zipCode].filter(Boolean).join(', ')}
                    </p>
                  ) : (
                    <p className="text-sm text-dark-tea">
                      {selectedOrder.pickupTime ? format(new Date(selectedOrder.pickupTime), 'MMM d, yyyy h:mm a') : 'ASAP'}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-secondary-tea uppercase tracking-wide mb-3">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <div>
                          <p className="font-medium text-dark-tea">{item.menuItem?.name || `Item ${i + 1}`}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-secondary-tea italic">"{item.specialInstructions}"</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-dark-tea">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-secondary-tea">×{item.quantity} @ ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-dark-tea">Total</span>
                    <span className="font-bold text-xl text-primary-tea">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Pipeline */}
                {selectedOrder.paymentStatus === 'paid' && selectedOrder.status !== 'cancelled' && (
                  <div>
                    <p className="text-xs text-secondary-tea uppercase tracking-wide mb-3">Update Order Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.map(s => {
                        const currentIdx = STATUS_FLOW.indexOf(selectedOrder.status as OrderStatus);
                        const targetIdx = STATUS_FLOW.indexOf(s);
                        const isCurrent = s === selectedOrder.status;
                        const isPast = targetIdx < currentIdx;
                        return (
                          <button
                            key={s}
                            onClick={() => !isCurrent && !isPast && handleStatusChange(selectedOrder, s)}
                            disabled={isCurrent || isPast}
                            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                              isCurrent
                                ? 'bg-primary-tea text-cream border-primary-tea cursor-default'
                                : isPast
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-dark-tea border-secondary-tea hover:bg-light-tea hover:border-primary-tea cursor-pointer'
                            }`}
                          >
                            {STATUS_ICONS[s]} {s}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleStatusChange(selectedOrder, 'cancelled')}
                        disabled={selectedOrder.status === 'cancelled'}
                        className="px-3 py-2 rounded-lg text-sm font-medium border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ❌ Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteClick(selectedOrder);
                    }}
                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Delete Order
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-primary-tea text-cream px-5 py-2 rounded-lg hover:bg-dark-tea transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Confirm */}
        <ConfirmModal
          isOpen={showStatusModal}
          onClose={() => { setShowStatusModal(false); setPendingStatus(''); }}
          onConfirm={confirmStatusChange}
          title="Update Order Status"
          message={selectedOrder ? `Update order #${selectedOrder._id.slice(-6).toUpperCase()} to "${pendingStatus}"?` : ''}
          confirmText="Update"
          confirmButtonClass="bg-primary-tea hover:bg-dark-tea"
          cancelText="Cancel"
          iconType="success"
        />

        {/* Delete Confirm */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTargetOrder(null); }}
          onConfirm={confirmDelete}
          title="Delete Order"
          message={deleteTargetOrder ? `Are you sure you want to delete order #${deleteTargetOrder._id.slice(-6).toUpperCase()}? This cannot be undone.` : ''}
          confirmText="Delete"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          cancelText="Cancel"
          iconType="error"
        />
      </div>
    </div>
  );
};

export default AdminOrders;
