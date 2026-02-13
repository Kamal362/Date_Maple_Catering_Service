import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/orderService';

interface OrderDetails {
  _id: string;
  orderId?: string;
  items: Array<{
    menuItem: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  orderType: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  pickupTime?: {
    date: string;
    time: string;
  };
}

const WaitingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(15); // Default 15 minutes

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (orderId) {
          const orderData = await getOrder(orderId);
          setOrder(orderData);
        }
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Simulate countdown timer
    const interval = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 60000); // Decrease by 1 minute every minute

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="section-padding bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section-padding bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-heading font-bold text-dark-tea mb-2">Error Loading Order</h2>
          <p className="text-secondary-tea mb-6">{error || 'Order not found'}</p>
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-primary-tea mb-2">Order Received!</h1>
            <p className="text-dark-tea">Thank you for your order. Your food is being prepared.</p>
          </div>

          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold">Order #{order.orderId || order._id.substring(0, 8)}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="border-t border-secondary-tea pt-4">
              <h3 className="font-heading font-semibold mb-3">Pickup Details</h3>
              {order.pickupTime && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-secondary-tea text-sm">Date</p>
                    <p className="font-medium">{new Date(order.pickupTime.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-secondary-tea text-sm">Time</p>
                    <p className="font-medium">{order.pickupTime.time}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-light-tea rounded-lg p-4 mb-4">
                <p className="text-dark-tea mb-2">Location for Pickup:</p>
                <p className="font-medium">Date & Maple Cafe</p>
                <p className="text-sm">123 Tea Street, Coffeeville, TC 12345</p>
              </div>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-secondary-tea">
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-secondary-tea text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-4 mt-4 border-t border-secondary-tea">
              <span className="font-bold">Total</span>
              <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Estimated Preparation Time</h3>
            <div className="text-center">
              <div className="inline-block bg-primary-tea text-cream rounded-full w-24 h-24 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">{estimatedTime}</span>
                <span className="text-sm ml-1">min</span>
              </div>
              <p className="text-dark-tea">Your order will be ready in approximately {estimatedTime} minutes</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/" className="btn-secondary mr-4">
              Back to Home
            </Link>
            <Link to={`/order-tracking/${order._id}`} className="btn-primary">
              Track Order Progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;