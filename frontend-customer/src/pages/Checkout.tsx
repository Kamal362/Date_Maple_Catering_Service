import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, createGuestOrder } from '../services/orderService';
import { getPaymentMethods, PaymentMethod } from '../services/paymentService';
import { syncCartWithBackend, getCart } from '../services/cartService';
import { isAuthenticated } from '../services/authService';

const Checkout: React.FC = () => {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'receipt' | 'digital'>('digital');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(!isAuthenticated());
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();

  // Calculate subtotal, tax, and total
  const subtotal = cartTotal || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  console.log('Cart items:', cartItems);
  console.log('Cart total:', cartTotal);
  console.log('Subtotal:', subtotal);
  console.log('Tax:', tax);
  console.log('Total:', total);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const data = await getPaymentMethods();
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
    
    // Validate required fields
    const validationErrors = [];
    
    // Validate guest info if guest checkout
    if (isGuest) {
      if (!guestInfo.firstName.trim()) validationErrors.push('First name is required');
      if (!guestInfo.lastName.trim()) validationErrors.push('Last name is required');
      if (!guestInfo.email.trim()) validationErrors.push('Email is required');
      if (!guestInfo.phone.trim()) validationErrors.push('Phone is required');
    }
    
    // Validate delivery address if delivery selected
    if (orderType === 'delivery') {
      const street = (document.getElementById('street') as HTMLInputElement)?.value.trim();
      const city = (document.getElementById('city') as HTMLInputElement)?.value.trim();
      const state = (document.getElementById('state') as HTMLInputElement)?.value.trim();
      const zip = (document.getElementById('zip') as HTMLInputElement)?.value.trim();
      
      if (!street) validationErrors.push('Street address is required');
      if (!city) validationErrors.push('City is required');
      if (!state) validationErrors.push('State is required');
      if (!zip) validationErrors.push('ZIP code is required');
    }
    
    // Validate pickup time if pickup selected
    if (orderType === 'pickup') {
      const date = (document.getElementById('date') as HTMLInputElement)?.value;
      const time = (document.getElementById('time') as HTMLInputElement)?.value;
      
      if (!date) validationErrors.push('Pickup date is required');
      if (!time) validationErrors.push('Pickup time is required');
    }
    
    // Validate payment method selection
    if (!paymentMethod) {
      validationErrors.push('Please select a payment method');
    }
    
    // Validate digital payment receipt
    if (paymentMethod === 'digital' && !proofOfPayment) {
      validationErrors.push('Payment receipt is required for digital payment');
    }
    
    // Show validation errors
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setShowValidationErrorModal(true);
      return;
    }
    
    try {
      console.log('=== CHECKOUT CART DEBUG INFO ===');
      console.log('Syncing frontend cart with backend before checkout');
      console.log('Frontend cart items:', cartItems);
      console.log('Cart items count:', cartItems.length);
      console.log('Cart items structure:', cartItems.map(item => ({
        name: item.name || 'Unknown',
        id: item.id || 'No ID',
        quantity: item.quantity || 0,
        hasId: !!(item.id)
      })));
      console.log('================================');
      
      // Sync frontend cart with backend before placing order
      const syncResult = await syncCartWithBackend(cartItems);
      console.log('Cart sync result:', syncResult);
      
      // If sync failed or no items were added, show appropriate error
      if (!syncResult) {
        console.log('Cart sync failed or no valid items to sync');
        setValidationErrors([
          'Unable to sync your cart. Please refresh the page and add items to your cart again.',
          'Make sure you are adding items from the current menu.'
        ]);
        setShowValidationErrorModal(true);
        return; // Stop the checkout process
      }
      
      // Verify the cart was created by trying to fetch it
      try {
        const backendCart = await getCart();
        console.log('Backend cart after sync:', backendCart);
        console.log('Backend cart items count:', backendCart.items?.length || 0);
        
        // Double-check that cart has items
        if (!backendCart.items || backendCart.items.length === 0) {
          console.log('Backend cart is still empty after sync');
          setValidationErrors([
            'Cart synchronization completed but no items were added to your cart.',
            'Please try adding items again or contact support.'
          ]);
          setShowValidationErrorModal(true);
          return; // Stop the checkout process
        }
      } catch (cartError) {
        console.error('Error fetching backend cart after sync:', cartError);
        setValidationErrors([
          'Unable to verify your cart. Please try again.',
          'If the problem persists, please refresh the page.'
        ]);
        setShowValidationErrorModal(true);
        return; // Stop the checkout process
      }
      
      console.log('Cart synced successfully with items, proceeding with order');
      
      // Prepare order data
      const orderData: any = {
        orderType,
        paymentMethod: paymentMethod === 'digital' ? 'receipt_upload' : paymentMethod,
        deliveryAddress: orderType === 'delivery' ? {
          street: (document.getElementById('street') as HTMLInputElement)?.value.trim(),
          city: (document.getElementById('city') as HTMLInputElement)?.value.trim(),
          state: (document.getElementById('state') as HTMLInputElement)?.value.trim(),
          zipCode: (document.getElementById('zip') as HTMLInputElement)?.value.trim()
        } : undefined,
        pickupTime: orderType === 'pickup' ? {
          date: (document.getElementById('date') as HTMLInputElement)?.value,
          time: (document.getElementById('time') as HTMLInputElement)?.value
        } : undefined
      };

      // Add guest info or cart items for guest checkout
      if (isGuest) {
        orderData.guestInfo = guestInfo;
        orderData.items = cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialInstructions: (item as any).specialInstructions || ''
        }));
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Append order data as JSON string
      formData.append('orderData', JSON.stringify(orderData));
      
      // Append payment receipt if uploaded
      if (proofOfPayment) {
        formData.append('paymentReceipt', proofOfPayment);
      }

      console.log('Submitting order with data:', orderData);
      console.log('FormData entries:', [...formData.entries()]);
      
      // Submit order - use guest checkout if not authenticated
      const response = isGuest ? await createGuestOrder(formData) : await createOrder(formData);
      console.log('Order response:', response);
      
      if (response.success) {
        // Set order ID and show success modal
        setOrderId(response.data?._id || null);
        setShowSuccessModal(true);
      } else {
        setValidationErrors(['Failed to place order. Please try again.']);
        setShowValidationErrorModal(true);
      }
    } catch (err: any) {
      console.error('Error placing order:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid order data. Please check your inputs.';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setValidationErrors([errorMessage]);
      setShowValidationErrorModal(true);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to order tracking page for all order types
    if (orderId) {
      navigate(`/order-tracking/${orderId}`);
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
              
              {/* Guest Info Section */}
              {isGuest && (
                <div className="mb-6 bg-cream border border-secondary-tea rounded-lg p-6">
                  <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="guestFirstName" className="block text-dark-tea mb-2">First Name *</label>
                      <input
                        type="text"
                        id="guestFirstName"
                        value={guestInfo.firstName}
                        onChange={(e) => setGuestInfo({...guestInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="guestLastName" className="block text-dark-tea mb-2">Last Name *</label>
                      <input
                        type="text"
                        id="guestLastName"
                        value={guestInfo.lastName}
                        onChange={(e) => setGuestInfo({...guestInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="guestEmail" className="block text-dark-tea mb-2">Email *</label>
                      <input
                        type="email"
                        id="guestEmail"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="guestPhone" className="block text-dark-tea mb-2">Phone *</label>
                      <input
                        type="tel"
                        id="guestPhone"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                        placeholder="(123) 456-7890"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

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
                {/* Credit Card - shown if enabled in admin */}
                {paymentMethods.find(m => m.type === 'credit_card' && m.isActive) && (
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
                )}
                
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
                
                {/* Digital Wallet - shown if there are active digital wallet methods */}
                {paymentMethods.filter(m => m.type === 'digital_wallet' && m.isActive).length > 0 && (
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
                )}
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
                        {paymentMethods
                          .filter(method => method.type === 'digital_wallet')
                          .map((method) => (
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
                        <div className="bg-white border border-secondary-tea rounded-lg p-6 shadow-sm">
                          {/* Payment Instructions Header */}
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-secondary-tea">
                            <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h4 className="font-bold text-lg text-dark-tea">Payment Instructions</h4>
                          </div>
                          
                          {/* Amount to Send */}
                          <div className="bg-cream rounded-lg p-4 mb-4">
                            <p className="text-sm text-secondary-tea mb-1">Amount to send:</p>
                            <p className="text-3xl font-bold text-primary-tea">${total.toFixed(2)}</p>
                          </div>
                          
                          {/* Payment Details */}
                          {getSelectedPaymentDetails() && (
                            <div className="mb-4">
                              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-secondary-tea">Payment Method:</span>
                                  <span className="font-semibold text-dark-tea">{getSelectedPaymentDetails()?.vendor}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-secondary-tea">Send to:</span>
                                  <span className="font-mono font-semibold text-primary-tea bg-white px-3 py-1 rounded border">
                                    {getSelectedPaymentDetails()?.accountAlias || getSelectedPaymentDetails()?.accountNumber}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-secondary-tea">Account Name:</span>
                                  <span className="font-semibold text-dark-tea">{getSelectedPaymentDetails()?.accountName}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Note */}
                          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <p className="text-sm text-yellow-800">
                              <span className="font-semibold">Important:</span> Include your order number in the payment note for faster processing.
                            </p>
                          </div>
                                              
                          {/* Proof of Payment Upload */}
                          <div className="border-t border-secondary-tea pt-6">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <h4 className="font-bold text-dark-tea">Proof of Payment</h4>
                            </div>
                            <p className="text-secondary-tea mb-4">Upload a screenshot of your completed payment:</p>
                                                
                            <div className="border-2 border-dashed border-secondary-tea rounded-lg p-6 text-center cursor-pointer hover:border-primary-tea hover:bg-cream transition-all duration-300">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id="proofOfPayment"
                                onChange={handleProofOfPaymentChange}
                              />
                              <label htmlFor="proofOfPayment" className="cursor-pointer block">
                                {proofOfPayment ? (
                                  <>
                                    <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-dark-tea font-medium">{proofOfPayment.name}</p>
                                    <p className="text-green-600 text-sm mt-1">✓ File uploaded successfully</p>
                                    <p className="text-secondary-tea text-sm mt-2">Click to change file</p>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-12 h-12 text-secondary-tea mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                    </svg>
                                    <p className="text-dark-tea font-medium mb-1">Click to upload screenshot</p>
                                    <p className="text-secondary-tea text-sm">PNG, JPG, or GIF up to 10MB</p>
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
                <svg className="w-16 h-16 text-primary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Validation Error Modal */}
      {showValidationErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-2xl font-heading font-bold text-primary-tea mb-4">Please Fix the Following Errors</h3>
                <ul className="text-left text-dark-tea mb-6 space-y-2">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowValidationErrorModal(false)}
                  className="btn-primary w-full py-3"
                >
                  OK
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