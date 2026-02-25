import api from '../utils/axios';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentMethodData {
  type: 'card';
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details: {
    name: string;
    email: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

// Create a payment intent for checkout
export const createPaymentIntent = async (amount: number): Promise<PaymentIntent> => {
  try {
    const response = await api.post('/stripe/create-payment-intent', {
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm a payment
export const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<any> => {
  try {
    const response = await api.post('/stripe/confirm-payment', {
      paymentIntentId,
      paymentMethodId,
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Get payment method details
export const getPaymentMethod = async (paymentMethodId: string): Promise<any> => {
  try {
    const response = await api.get(`/stripe/payment-method/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment method:', error);
    throw error;
  }
};

// Create a customer in Stripe
export const createStripeCustomer = async (email: string, name: string): Promise<any> => {
  try {
    const response = await api.post('/stripe/create-customer', {
      email,
      name,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Save payment method to customer
export const savePaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<any> => {
  try {
    const response = await api.post('/stripe/save-payment-method', {
      customerId,
      paymentMethodId,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
};

// Get customer's saved payment methods
export const getSavedPaymentMethods = async (customerId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/stripe/customer/${customerId}/payment-methods`);
    return response.data.paymentMethods;
  } catch (error) {
    console.error('Error fetching saved payment methods:', error);
    throw error;
  }
};

// Process refund
export const processRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<any> => {
  try {
    const response = await api.post('/stripe/refund', {
      paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

// Get Stripe publishable key
export const getStripePublishableKey = async (): Promise<string> => {
  try {
    const response = await api.get('/stripe/config');
    return response.data.publishableKey;
  } catch (error) {
    console.error('Error fetching Stripe config:', error);
    throw error;
  }
};
