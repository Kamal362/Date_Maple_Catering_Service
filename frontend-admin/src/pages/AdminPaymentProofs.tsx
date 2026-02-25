import React, { useState, useEffect } from 'react';
import { getOrders, updatePaymentStatus, deleteOrder, Order } from '../services/orderService';
import ConfirmModal from '../components/ConfirmModal';

const AdminPaymentProofs: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this order?'
  });
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleVerifyClick = (order: Order) => {
    setSelectedOrder(order);
    setShowVerifyModal(true);
  };

  const handleRejectClick = (order: Order) => {
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedOrder) return;
    try {
      await updatePaymentStatus(selectedOrder._id, 'paid');
      setShowVerifyModal(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedOrder) return;
    try {
      await updatePaymentStatus(selectedOrder._id, 'failed');
      setShowRejectModal(false);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError('Failed to reject payment');
    }
  };

  const handleViewReceipt = (order: Order) => {
    setSelectedReceiptOrder(order);
    setShowReceiptModal(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setDeleteModalConfig({
      title: 'Delete Order',
      message: `Are you sure you want to delete order #${order._id?.slice(-6)}? This action cannot be undone.`
    });
    setDeleteAction(() => async () => {
      try {
        await deleteOrder(order._id || '');
        await fetchOrders();
        setShowDeleteModal(false);
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order');
      }
    });
    setShowDeleteModal(true);
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.paymentStatus === filterStatus;
  });

  const pendingCount = orders.filter(o => o.paymentStatus === 'pending').length;
  const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold text-primary-tea mb-8">Payment Proofs</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-secondary-tea">Total Orders</p>
          <p className="text-2xl font-bold text-primary-tea">{orders.length}</p>
        </div>
        <div className="card p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-yellow-600">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <p className="text-sm text-green-600">Paid</p>
          <p className="text-2xl font-bold text-green-700">{paidCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4 mb-6">
        <label className="block text-sm font-medium text-dark-tea mb-2">Filter by Status</label>
        <select
          className="w-full md:w-64 px-3 py-2 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending Verification</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
          <p className="mt-4 text-dark-tea">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-secondary-tea">No orders found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary-tea/20 sticky top-0 z-10">
                <tr className="border-b border-secondary-tea">
                  <th className="text-left py-3 px-4 text-dark-tea">Order ID</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Customer</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Amount</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Receipt</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Status</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Date</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Confirm</th>
                  <th className="text-left py-3 px-4 text-dark-tea">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-secondary-tea hover:bg-light-tea/30">
                    <td className="py-3 px-4 font-medium text-dark-tea">#{order._id?.slice(-6)}</td>
                    <td className="py-3 px-4 text-dark-tea">{order.user?.firstName} {order.user?.lastName}</td>
                    <td className="py-3 px-4 text-dark-tea">${order.totalAmount?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {order.paymentReceipt ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          None
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary-tea">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {(!order.paymentStatus || order.paymentStatus === 'pending') ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleVerifyClick(order)}
                            className="text-xs bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectClick(order)}
                            className="text-xs bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-secondary-tea">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {order.paymentReceipt && (
                          <button 
                            onClick={() => handleViewReceipt(order)}
                            className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded"
                          >
                            View Receipt
                          </button>
                        )}
                        {!order.paymentReceipt && (!order.paymentStatus || order.paymentStatus === 'pending') && (
                          <span className="text-xs text-secondary-tea">No receipt</span>
                        )}
                        <button 
                          onClick={() => handleDeleteOrder(order)}
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
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAction || (() => {})}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        confirmText="Delete"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        cancelText="Cancel"
      />

      {/* Approve Payment Confirmation Modal */}
      <ConfirmModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleConfirmVerify}
        title="Approve Payment"
        message={selectedOrder ? `Are you sure you want to approve payment for order #${selectedOrder._id?.slice(-6)}? This will mark the payment as paid.` : ''}
        confirmText="Approve"
        confirmButtonClass="bg-green-500 hover:bg-green-600"
        cancelText="Cancel"
        iconType="success"
      />

      {/* Reject Payment Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleConfirmReject}
        title="Reject Payment"
        message={selectedOrder ? `Are you sure you want to reject payment for order #${selectedOrder._id?.slice(-6)}? This will mark the payment as rejected.` : ''}
        confirmText="Reject"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        cancelText="Cancel"
        iconType="error"
      />

      {/* Receipt View Modal */}
      {showReceiptModal && selectedReceiptOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReceiptModal(false)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Payment Receipt - Order #{selectedReceiptOrder._id?.slice(-6)}
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedReceiptOrder.paymentReceipt ? (
              <img 
                src={selectedReceiptOrder.paymentReceipt} 
                alt="Payment Receipt" 
                className="max-w-full h-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No receipt uploaded for this order.
              </div>
            )}
            <div className="mt-4 flex justify-center gap-4">
              <a
                href={selectedReceiptOrder.paymentReceipt || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-tea text-cream px-4 py-2 rounded hover:bg-dark-tea transition-colors"
              >
                Open in New Tab
              </a>
              {(!selectedReceiptOrder.paymentStatus || selectedReceiptOrder.paymentStatus === 'pending') && (
                <>
                  <button
                    onClick={() => {
                      setShowReceiptModal(false);
                      handleVerifyClick(selectedReceiptOrder);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Approve Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowReceiptModal(false);
                      handleRejectClick(selectedReceiptOrder);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Reject Payment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminPaymentProofs;
