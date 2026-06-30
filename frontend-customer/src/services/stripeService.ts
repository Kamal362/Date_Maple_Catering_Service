import axiosInstance from '../utils/axios';

const apiClient = axiosInstance;

export interface StripeConfig {
  publishableKey: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  amount: number;
  currency: string;
}

export const getStripeConfig = async (): Promise<StripeConfig> => {
  const response = await apiClient.get('/stripe/config');
  return response.data;
};

export const createPaymentIntent = async (
  amount: number,
  metadata: Record<string, string> = {}
): Promise<PaymentIntentResponse> => {
  const response = await apiClient.post('/stripe/create-payment-intent', {
    amount,
    currency: 'usd',
    metadata,
  });
  return response.data;
};
