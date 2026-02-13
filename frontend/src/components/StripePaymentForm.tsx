import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useToast } from '../context/ToastContext';
import { createPaymentIntent, getStripePublishableKey } from '../services/stripeService';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel?: () => void;
  customerEmail?: string;
  customerName?: string;
}

const PaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  onSuccess,
  onCancel,
  customerEmail,
  customerName,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [billingDetails, setBillingDetails] = useState({
    name: customerName || '',
    email: customerEmail || '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

  useEffect(() => {
    // Create payment intent when component mounts
    const initPayment = async () => {
      try {
        const { clientSecret } = await createPaymentIntent(amount);
        setClientSecret(clientSecret);
      } catch (error) {
        toast.error('Failed to initialize payment. Please try again.');
      }
    };

    initPayment();
  }, [amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setBillingDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setBillingDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment system not ready. Please refresh and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card information is required.');
      return;
    }

    setProcessing(true);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess(paymentIntent.id);
      } else {
        toast.warning('Payment processing. Please wait...');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#5D4037',
        fontFamily: '"Poppins", sans-serif',
        '::placeholder': {
          color: '#D2B48C',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-light-tea p-4 rounded-lg">
        <h3 className="text-lg font-heading font-semibold mb-2 text-primary-tea">
          Payment Amount: ${amount.toFixed(2)}
        </h3>
      </div>

      {/* Billing Details */}
      <div>
        <h4 className="text-md font-heading font-semibold mb-4 text-primary-tea">
          Billing Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={billingDetails.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={billingDetails.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-tea mb-2">
              Address
            </label>
            <input
              type="text"
              name="address.line1"
              value={billingDetails.address.line1}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-2">
              City
            </label>
            <input
              type="text"
              name="address.city"
              value={billingDetails.address.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-2">
              State
            </label>
            <input
              type="text"
              name="address.state"
              value={billingDetails.address.state}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="NY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-tea mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              name="address.postal_code"
              value={billingDetails.address.postal_code}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div>
        <label className="block text-sm font-medium text-dark-tea mb-2">
          Card Information *
        </label>
        <div className="p-4 border border-secondary-tea rounded-md bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm text-blue-800">
          Your payment is secured by Stripe. We never store your card details.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary px-8 py-3"
          disabled={!stripe || processing}
        >
          {processing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
};

// Main wrapper component with Stripe Elements provider
let stripePromise: Promise<Stripe | null> | null = null;

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const key = await getStripePublishableKey();
        setPublishableKey(key);
        stripePromise = loadStripe(key);
      } catch (error) {
        toast.error('Failed to load payment system. Please refresh the page.');
      }
    };

    fetchKey();
  }, []);

  if (!publishableKey || !stripePromise) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
