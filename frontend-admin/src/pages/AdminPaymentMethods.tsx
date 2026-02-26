import React, { useState, useEffect } from 'react';
import { getAllPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, PaymentMethod } from '../services/paymentService';
import PaymentMethodForm from '../components/PaymentMethodForm';
import ConfirmModal from '../components/ConfirmModal';

const getPaymentTypeIcon = (type: string) => {
  switch (type) {
    case 'credit_card':
      return '💳';
    case 'digital_wallet':
      return '💰';
    case 'bank_transfer':
      return '🏦';
    case 'cash':
      return '💵';
    default:
      return '💳';
  }
};

const getPaymentTypeLabel = (type: string) => {
  switch (type) {
    case 'credit_card':
      return 'Credit Card';
    case 'digital_wallet':
      return 'Digital Wallet';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'cash':
      return 'Cash';
    default:
      return 'Other';
  }
};

type TabType = 'digital_wallet' | 'credit_card' | 'bank_transfer' | 'cash' | 'other';

const tabConfig: Record<TabType, { label: string; icon: string; description: string }> = {
  digital_wallet: { label: 'Digital Wallets', icon: '💰', description: 'Manage Venmo, Cash App, Zelle, PayPal, etc.' },
  credit_card: { label: 'Credit Card', icon: '💳', description: 'Enable or disable credit card payments' },
  bank_transfer: { label: 'Bank Transfers', icon: '🏦', description: 'Manage wire transfer, ACH options' },
  cash: { label: 'Cash', icon: '💵', description: 'Manage cash on delivery options' },
  other: { label: 'Other', icon: '💳', description: 'Manage custom payment methods' }
};

const AdminPaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('digital_wallet');
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

  const handleAddForTab = (tab: TabType) => {
    setEditingMethod({
      type: tab,
      vendor: tab === 'credit_card' ? 'Visa' : tab === 'digital_wallet' ? 'Venmo' : 'Custom',
      accountName: '',
      accountNumber: '',
      accountAlias: '',
      isActive: true,
      displayOrder: 0
    } as PaymentMethod);
    setShowModal(true);
  };

  const filteredMethods = paymentMethods.filter(method => method.type === activeTab);
  const creditCardMethod = paymentMethods.find(method => method.type === 'credit_card');
  
  const activeCount = filteredMethods.filter(m => m.isActive).length;

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
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow border-b border-gray-200">
        <div className="flex flex-wrap">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary-tea text-primary-tea bg-cream'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tabConfig[tab].icon}</span>
              {tabConfig[tab].label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab ? 'bg-primary-tea text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {paymentMethods.filter(m => m.type === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg shadow p-6">
        {/* Credit Card Tab - Simple Toggle */}
        {activeTab === 'credit_card' ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-6xl">{tabConfig[activeTab].icon}</span>
              <h2 className="text-2xl font-semibold text-gray-900 mt-4">{tabConfig[activeTab].label}</h2>
              <p className="text-gray-500 mt-2">{tabConfig[activeTab].description}</p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Credit Card Payments</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Allow customers to pay with credit cards (Visa, Mastercard, Amex, Discover)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${creditCardMethod?.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {creditCardMethod?.isActive ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => {
                        if (creditCardMethod) {
                          toggleStatus(creditCardMethod);
                        } else {
                          // Create default credit card payment method
                          handleSave({
                            type: 'credit_card',
                            vendor: 'Credit Card',
                            accountName: 'Credit Card Payments',
                            accountNumber: '',
                            accountAlias: '',
                            isActive: true,
                            description: 'Accept Visa, Mastercard, American Express, and Discover',
                            instructions: 'Enter your card details securely to complete the payment.'
                          } as PaymentMethod);
                        }
                      }}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        creditCardMethod?.isActive
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          creditCardMethod?.isActive
                            ? 'translate-x-7'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {creditCardMethod?.isActive && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Supported Card Types:</h4>
                    <div className="flex gap-4">
                      <span className="px-3 py-1 bg-white rounded border text-sm">Visa</span>
                      <span className="px-3 py-1 bg-white rounded border text-sm">Mastercard</span>
                      <span className="px-3 py-1 bg-white rounded border text-sm">Amex</span>
                      <span className="px-3 py-1 bg-white rounded border text-sm">Discover</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{tabConfig[activeTab].icon}</span>
                  {tabConfig[activeTab].label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeCount} active {activeCount === 1 ? 'method' : 'methods'} out of {filteredMethods.length} total
                </p>
              </div>
              <button 
                onClick={() => handleAddForTab(activeTab)}
                className="bg-primary-tea hover:bg-dark-tea text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add {tabConfig[activeTab].label.slice(0, -1)}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading payment methods...</p>
              </div>
            ) : filteredMethods.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No {tabConfig[activeTab].label.toLowerCase()} configured yet.</p>
                <button 
                  onClick={() => handleAddForTab(activeTab)}
                  className="text-primary-tea hover:text-dark-tea font-medium"
                >
                  Add your first {tabConfig[activeTab].label.slice(0, -1).toLowerCase()}
                </button>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Vendor</th>
                      <th className="text-left py-3 px-4">Name/Alias</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-center py-3 px-4">Order</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredMethods]
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((method) => (
                      <tr key={method._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{method.vendor}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate font-medium">{method.accountName}</div>
                          {method.accountAlias && (
                            <div className="text-xs text-gray-500 truncate">{method.accountAlias}</div>
                          )}
                          {method.cardNumber && (
                            <div className="text-xs text-gray-500">{method.cardNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-gray-600">{method.description || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{method.displayOrder || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
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
                              className={`text-xs px-2 py-1 rounded ${
                                method.isActive 
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {method.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button 
                              onClick={() => handleEdit(method)}
                              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(method)}
                              className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded"
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
          </>
        )}
      </div>

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
