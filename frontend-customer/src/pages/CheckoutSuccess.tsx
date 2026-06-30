import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { trackOrder, Order } from '../services/orderService';
import { useTheme } from '../context/ThemeContext';

const CheckoutSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setError('Order ID is missing');
          return;
        }
        const orderData = await trackOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getPaymentMethodLabel = (method?: string) => {
    if (method === 'stripe') return 'Stripe Card';
    if (method === 'receipt_upload') return 'Receipt Upload';
    return method?.replace('_', ' ') || 'Unknown';
  };

  if (loading) {
    return (
      <div className={`section-padding ${isDark ? 'bg-gray-900' : 'bg-cream'} min-h-screen flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`section-padding ${isDark ? 'bg-gray-900' : 'bg-cream'} min-h-screen flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-heading font-bold text-dark-tea mb-2">Order Not Found</h2>
          <p className="text-secondary-tea mb-6">{error || 'We could not find the order you are looking for.'}</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    );
  }

  const shortOrderId = order._id.slice(-6).toUpperCase();

  return (
    <div className={`section-padding ${isDark ? 'bg-gray-900' : 'bg-cream'} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h1 className={`text-3xl font-heading font-bold ${isDark ? 'text-amber-400' : 'text-primary-tea'} mb-2`}>Payment Successful!</h1>
            <p className={isDark ? 'text-gray-300' : 'text-dark-tea'}>
              Thank you for your order. Your payment has been processed successfully.
            </p>
          </div>

          <div className={`card p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold">Order #{shortOrderId}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                order.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : order.paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.paymentStatus || 'pending'}
              </span>
            </div>

            <div className="border-t border-secondary-tea pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-tea">Order Type</span>
                <span className="font-medium capitalize">{order.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-tea">Payment Method</span>
                <span className="font-medium capitalize">{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-tea">Items</span>
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-secondary-tea">
                <span className="font-bold text-lg">Total Paid</span>
                <span className="font-bold text-lg text-primary-tea">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={`card p-6 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <h3 className={`text-xl font-heading font-semibold mb-4 ${isDark ? 'text-gray-100' : ''}`}>What's Next?</h3>
            <p className="text-secondary-tea mb-4">
              Your order is now being prepared. You can track its progress in real time using the order tracking page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/order-tracking/${order._id}`)}
                className="btn-primary flex-1 py-3 text-center"
              >
                Track Order
              </button>
              <Link to="/" className="btn-secondary flex-1 py-3 text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
