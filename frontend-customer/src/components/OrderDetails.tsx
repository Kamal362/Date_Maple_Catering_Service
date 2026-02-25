import React, { useState } from 'react';
import { format } from 'date-fns';
import { Order, cancelOrder } from '../services/orderService';
import ReorderButton from './ReorderButton';
import { useToast } from '../context/ToastContext';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
  const [localOrder, setLocalOrder] = useState<Order>(order);
  const toast = useToast();

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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-accent-tea text-cream';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === 'delivery' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const updatedOrder = await cancelOrder(localOrder._id);
        setLocalOrder(updatedOrder);
        toast.success('Order cancelled successfully');
      } catch (error) {
        console.error('Error cancelling order:', error);
        toast.error('Failed to cancel order');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-cream rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-secondary-tea">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-primary-tea">Order Details</h2>
            <p className="text-secondary-tea mt-1">
              Order #{localOrder._id.slice(-6).toUpperCase()} • {format(new Date(localOrder.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                {getOrderTypeIcon(localOrder.orderType)}
                <span className="capitalize font-medium">{localOrder.orderType}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(localOrder.status)}`}>
                {localOrder.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(localOrder.paymentStatus)}`}>
                {localOrder.paymentStatus}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-light-tea rounded-lg p-4">
              <h3 className="font-heading font-semibold mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-secondary-tea">Name</p>
                  <p className="font-medium">{localOrder.user.firstName} {localOrder.user.lastName}</p>
                </div>
                <div>
                  <p className="text-secondary-tea">Email</p>
                  <p className="font-medium">{localOrder.user.email}</p>
                </div>
                <div>
                  <p className="text-secondary-tea">Payment Method</p>
                  <p className="font-medium capitalize">{localOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-secondary-tea">Order Date</p>
                  <p className="font-medium">{format(new Date(localOrder.createdAt), 'MMM dd, yyyy • HH:mm')}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-heading font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {localOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-secondary-tea">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.menuItem?.name}</h4>
                      <p className="text-sm text-secondary-tea">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)} each</p>
                      <p className="text-sm text-secondary-tea">
                        ${(item.price * item.quantity).toFixed(2)} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Total */}
              <div className="mt-4 pt-4 border-t border-secondary-tea">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Subtotal</span>
                  <span className="text-lg font-medium">
                    ${(localOrder.totalAmount - (localOrder.tax || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Tax</span>
                  <span className="text-lg font-medium">
                    ${localOrder.tax?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-tea">
                    ${localOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-heading font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-3">
                {[
                  { status: 'Order Placed', date: localOrder.createdAt, completed: true },
                  { status: 'Confirmed', date: localOrder.status === 'confirmed' || localOrder.status === 'preparing' || localOrder.status === 'ready' || localOrder.status === 'delivered' ? new Date(Date.now() - 3600000).toISOString() : null, completed: localOrder.status === 'confirmed' || localOrder.status === 'preparing' || localOrder.status === 'ready' || localOrder.status === 'delivered' },
                  { status: 'Preparing', date: localOrder.status === 'preparing' || localOrder.status === 'ready' || localOrder.status === 'delivered' ? new Date(Date.now() - 1800000).toISOString() : null, completed: localOrder.status === 'preparing' || localOrder.status === 'ready' || localOrder.status === 'delivered' },
                  { status: 'Ready for Pickup/Delivery', date: localOrder.status === 'ready' || localOrder.status === 'delivered' ? new Date(Date.now() - 600000).toISOString() : null, completed: localOrder.status === 'ready' || localOrder.status === 'delivered' },
                  { status: 'Completed', date: localOrder.status === 'delivered' ? localOrder.updatedAt : null, completed: localOrder.status === 'delivered' }
                ].map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                      step.completed 
                        ? 'bg-primary-tea text-cream' 
                        : 'bg-secondary-tea text-dark-tea'
                    }`}>
                      {step.completed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? '' : 'text-secondary-tea'}`}>
                        {step.status}
                      </p>
                      {step.date && (
                        <p className="text-sm text-secondary-tea">
                          {format(new Date(step.date), 'MMM dd, yyyy • HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-secondary-tea bg-cream flex flex-wrap justify-between gap-3 items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-secondary-tea text-secondary-tea rounded-md hover:bg-secondary-tea hover:text-dark-tea transition-colors"
          >
            Close
          </button>
          
          {/* Cancel Order Button - only for pending orders */}
          {localOrder.status === 'pending' && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
            >
              Cancel Order
            </button>
          )}
          
          <ReorderButton 
            order={localOrder}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;