import React, { useState } from 'react';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock order data
      const mockOrder = {
        id: orderId,
        date: '2023-05-15',
        items: [
          {
            name: 'Salted Date Caramel Latte',
            quantity: 2,
            price: 6.50
          },
          {
            name: 'Cinnamon Roll',
            quantity: 1,
            price: 4.50
          }
        ],
        total: 17.50,
        status: 'Preparing',
        estimatedDelivery: '2023-05-15 14:30'
      };
      
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Preparing': return 'bg-purple-100 text-purple-800';
      case 'Ready': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold mb-8 text-primary-tea">Order Tracking</h1>
        
        <div className="card p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="orderId" className="block text-dark-tea mb-2">Order ID</label>
              <input
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              />
            </div>
            <div className="self-end">
              <button 
                type="submit" 
                disabled={loading}
                className={`btn-primary px-6 py-3 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
          </form>
        </div>
        
        {order && (
          <div className="card p-6">
            <div className="flex flex-wrap justify-between items-start mb-6 pb-6 border-b border-secondary-tea">
              <div>
                <h2 className="text-2xl font-heading font-semibold">Order #{order.id}</h2>
                <p className="text-secondary-tea">Placed on {order.date}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-heading font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-secondary-tea">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-secondary-tea">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-secondary-tea">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-heading font-semibold mb-4">Order Progress</h3>
                <div className="space-y-4">
                  {['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'].map((status, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        index <= ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'].indexOf(order.status)
                          ? 'bg-primary-tea text-cream'
                          : 'bg-secondary-tea text-dark-tea'
                      }`}>
                        {index < ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'].indexOf(order.status) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={
                        index <= ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'].indexOf(order.status)
                          ? 'font-medium'
                          : 'text-secondary-tea'
                      }>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
                
                {order.status !== 'Delivered' && (
                  <div className="mt-8 p-4 bg-light-tea rounded-lg">
                    <p className="font-medium mb-2">Estimated Delivery</p>
                    <p className="text-lg">{order.estimatedDelivery}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!order && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-secondary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h2 className="text-2xl font-heading font-semibold mb-2">Track Your Order</h2>
            <p className="text-dark-tea max-w-md mx-auto">
              Enter your order ID above to track the status of your order in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;