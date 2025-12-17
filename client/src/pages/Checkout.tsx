import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { getAllPaymentMethods, PaymentMethod } from '../services/paymentService';

const Checkout: React.FC = () => {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'receipt' | 'digital'>('digital');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();

  // Calculate subtotal, tax, and total
  const subtotal = cartTotal || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const data = await getAllPaymentMethods();
        setPaymentMethods(data);
        if (data.length > 0) {
          setSelectedPaymentMethod(data[0]._id || '');
        }
      } catch (err) {
        setError('Failed to load payment methods');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleProofOfPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfPayment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare order data
      const orderData = {
        orderType,
        paymentMethod: paymentMethod === 'digital' ? 'receipt_upload' : paymentMethod,
        deliveryAddress: orderType === 'delivery' ? {
          street: (document.getElementById('street') as HTMLInputElement)?.value || '',
          city: (document.getElementById('city') as HTMLInputElement)?.value || '',
          state: (document.getElementById('state') as HTMLInputElement)?.value || '',
          zipCode: (document.getElementById('zip') as HTMLInputElement)?.value || ''
        } : undefined,
        pickupTime: orderType === 'pickup' ? {
          date: (document.getElementById('date') as HTMLInputElement)?.value || '',
          time: (document.getElementById('time') as HTMLInputElement)?.value || ''
        } : undefined
      };

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append order data as JSON string
      formData.append('orderData', JSON.stringify(orderData));
      
      // Append payment receipt if uploaded
      if (proofOfPayment) {
        formData.append('paymentReceipt', proofOfPayment);
      }

      // Submit order
      const response = await createOrder(formData);
      
      if (response.success) {
        // Set order ID and show success modal
        setOrderId(response.data?._id || null);
        setShowSuccessModal(true);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to appropriate page based on order type
    if (orderId) {
      if (orderType === 'delivery') {
        // For delivery, go to tracking page
        navigate(`/order-tracking/${orderId}`);
      } else {
        // For pickup, go to waiting page
        navigate(`/waiting/${orderId}`);
      }
    }
  };

  // Get selected payment method details
  const getSelectedPaymentDetails = () => {
    return paymentMethods.find(method => method._id === selectedPaymentMethod);
  };

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold mb-8 text-primary-tea">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6 mb-8">
              <h2 className="text-2xl font-heading font-semibold mb-6">Delivery Method</h2>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                    orderType === 'delivery' 
                      ? 'border-primary-tea bg-primary-tea text-cream' 
                      : 'border-secondary-tea hover:border-accent-tea'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="font-medium">Delivery</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                    orderType === 'pickup' 
                      ? 'border-primary-tea bg-primary-tea text-cream' 
                      : 'border-secondary-tea hover:border-accent-tea'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                    <span className="font-medium">Pickup</span>
                  </div>
                </button>
              </div>
              
              {orderType === 'delivery' ? (
                <div className="mb-6">
                  <h3 className="text-xl font-heading font-semibold mb-4">Delivery Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="street" className="block text-dark-tea mb-2">Street Address</label>
                      <input
                        type="text"
                        id="street"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-dark-tea mb-2">City</label>
                      <input
                        type="text"
                        id="city"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-dark-tea mb-2">State</label>
                      <input
                        type="text"
                        id="state"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-dark-tea mb-2">ZIP Code</label>
                      <input
                        type="text"
                        id="zip"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-xl font-heading font-semibold mb-4">Pickup Time</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-dark-tea mb-2">Date</label>
                      <input
                        type="date"
                        id="date"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="block text-dark-tea mb-2">Time</label>
                      <input
                        type="time"
                        id="time"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="card p-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Payment Method</h2>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-primary-tea bg-primary-tea text-cream' 
                      : 'border-secondary-tea hover:border-accent-tea'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <span className="font-medium">Credit Card</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('receipt')}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'receipt' 
                      ? 'border-primary-tea bg-primary-tea text-cream' 
                      : 'border-secondary-tea hover:border-accent-tea'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span className="font-medium">Upload Receipt</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('digital')}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'digital' 
                      ? 'border-primary-tea bg-primary-tea text-cream' 
                      : 'border-secondary-tea hover:border-accent-tea'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="font-medium">Digital Wallet</span>
                  </div>
                </button>
              </div>
              
              {paymentMethod === 'card' ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-dark-tea mb-2">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-dark-tea mb-2">Expiry Date</label>
                      <input
                        type="text"
                        id="expiry"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-dark-tea mb-2">CVV</label>
                      <input
                        type="text"
                        id="cvv"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cardName" className="block text-dark-tea mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              ) : paymentMethod === 'receipt' ? (
                <div>
                  <label htmlFor="receipt" className="block text-dark-tea mb-2">Upload Payment Receipt</label>
                  <div className="border-2 border-dashed border-secondary-tea rounded-lg p-8 text-center">
                    <svg className="w-12 h-12 text-secondary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="text-dark-tea mb-2">Drag and drop your receipt here</p>
                    <p className="text-secondary-tea text-sm mb-4">or</p>
                    <button className="btn-secondary">
                      Browse Files
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-4">Select Digital Payment Method</h3>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Loading payment methods...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      <p>{error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {paymentMethods.map((method) => (
                          <div 
                            key={method._id}
                            onClick={() => setSelectedPaymentMethod(method._id || '')}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              selectedPaymentMethod === method._id 
                                ? 'border-primary-tea bg-primary-tea bg-opacity-10' 
                                : 'border-secondary-tea hover:border-accent-tea'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-lg">{method.vendor}</h4>
                              {selectedPaymentMethod === method._id && (
                                <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-dark-tea">
                              {method.accountAlias || method.accountNumber}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {selectedPaymentMethod && (
                        <div className="bg-cream border border-secondary-tea rounded-lg p-4">
                          <h4 className="font-bold mb-2">Payment Instructions</h4>
                          <p className="text-dark-tea mb-2">
                            Please send <span className="font-bold text-primary-tea">${total.toFixed(2)}</span> to:
                          </p>
                          {getSelectedPaymentDetails() && (
                            <div className="mb-3">
                              <p className="font-medium">{getSelectedPaymentDetails()?.vendor}: <span className="text-primary-tea">{getSelectedPaymentDetails()?.accountAlias || getSelectedPaymentDetails()?.accountNumber}</span></p>
                              <p className="text-sm text-secondary-tea">Account Name: {getSelectedPaymentDetails()?.accountName}</p>
                            </div>
                          )}
                          <p className="text-sm text-secondary-tea">Include your order number in the payment note.</p>
                                              
                          {/* Proof of Payment Upload */}
                          <div className="mt-4 pt-4 border-t border-secondary-tea">
                            <h4 className="font-bold mb-2">Proof of Payment</h4>
                            <p className="text-dark-tea mb-3">Upload a screenshot of your payment as proof:</p>
                                                
                            <div className="border-2 border-dashed border-secondary-tea rounded-lg p-4 text-center cursor-pointer hover:border-primary-tea transition-colors duration-300">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id="proofOfPayment"
                                onChange={handleProofOfPaymentChange}
                              />
                              <label htmlFor="proofOfPayment" className="cursor-pointer">
                                {proofOfPayment ? (
                                  <>
                                    <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-dark-tea mb-1 font-medium">{proofOfPayment.name}</p>
                                    <p className="text-green-600 text-sm mb-2">File uploaded successfully!</p>
                                    <p className="text-secondary-tea text-sm">Click to change file</p>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-12 h-12 text-secondary-tea mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                    </svg>
                                    <p className="text-dark-tea mb-1">Click to upload proof of payment</p>
                                    <p className="text-secondary-tea text-sm">PNG, JPG, GIF up to 10MB</p>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="card p-6 sticky top-6">
              <h2 className="text-2xl font-heading font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-secondary-tea text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="flex justify-between pt-4 border-t border-secondary-tea">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-secondary-tea">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleSubmit}
                className="btn-primary w-full py-3 mb-4"
              >
                Place Order
              </button>
              
              <Link to="/cart" className="btn-secondary w-full text-center block py-3">
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-2xl font-heading font-bold text-primary-tea mb-2">Order Placed Successfully!</h3>
                <p className="text-dark-tea mb-4">
                  Your order has been placed successfully and is now waiting for admin approval.
                </p>
                <p className="text-secondary-tea text-sm mb-6">
                  You will be notified once your payment has been verified.
                </p>
                <button
                  onClick={handleModalClose}
                  className="btn-primary w-full py-3"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;