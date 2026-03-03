import axiosInstance from '../utils/axios';

export interface TaxSettings {
  taxEnabled: boolean;
  taxRate: number; // percentage e.g. 8 = 8%
  taxLabel: string;
}

const DEFAULT_TAX: TaxSettings = {
  taxEnabled: true,
  taxRate: 8,
  taxLabel: 'Tax',
};

export const getTaxSettings = async (): Promise<TaxSettings> => {
  try {
    const response = await axiosInstance.get('/tax');
    return response.data;
  } catch (error) {
    console.error('Error fetching tax settings, using defaults:', error);
    return DEFAULT_TAX;
  }
};
