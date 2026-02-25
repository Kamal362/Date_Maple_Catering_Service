import React, { useState, useEffect } from 'react';
import { getAllPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, PaymentMethod } from '../services/paymentService';
import PaymentMethodForm from '../components/PaymentMethodForm';
import ConfirmModal from '../components/ConfirmModal';

const AdminPaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this payment method?'
  });
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

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

  const handleAdd = () => {
    setEditingMethod(null);
    setShowModal(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowModal(true);
  };

  const handleDelete = (method: PaymentMethod) => {
    setDeleteModalConfig({
      title: 'Delete Payment Method',
      message: `Are you sure you want to delete "${method.vendor}"? This action cannot be undone.`
    });
    setDeleteAction(() => async () => {
      try {
        await deletePaymentMethod(method._id || '');
        await fetchPaymentMethods();
        setShowDeleteModal(false);
      } catch (err) {
        console.error('Error deleting payment method:', err);
        setError('Failed to delete payment method');
      }
    });
    setShowDeleteModal(true);
  };

  const handleSave = async (method: PaymentMethod) => {
    try {
      if (editingMethod && editingMethod._id) {
        await updatePaymentMethod(editingMethod._id, method);
      } else {
        await createPaymentMethod(method);
      }
      await fetchPaymentMethods();
      setShowModal(false);
      setEditingMethod(null);
    } catch (err) {
      console.error('Error saving payment method:', err);
      setError('Failed to save payment method');
    }
  };

  const toggleStatus = async (method: PaymentMethod) => {
    try {
      await updatePaymentMethod(method._id || '', { isActive: !method.isActive });
      await fetchPaymentMethods();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
        <button 
          onClick={handleAdd}
          className="bg-primary-tea hover:bg-dark-tea text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Payment Method
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No payment methods found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Vendor</th>
                <th className="text-left py-3 px-4">Alias</th>
                <th className="text-left py-3 px-4">Account Name</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr key={method._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{method.vendor}</td>
                  <td className="py-3 px-4">{method.accountAlias}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{method.accountName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      method.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleStatus(method)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        {method.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        onClick={() => handleEdit(method)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(method)}
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

      {/* Payment Method Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h2>
              <PaymentMethodForm
                paymentMethod={editingMethod}
                onSave={handleSave}
                onCancel={() => {
                  setShowModal(false);
                  setEditingMethod(null);
                }}
              />
            </div>
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
    </div>
  );
};

export default AdminPaymentMethods;
