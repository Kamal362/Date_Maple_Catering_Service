import api from '../utils/axios';

export interface TaxSettings {
  taxEnabled: boolean;
  taxRate: number;
  taxLabel: string;
}

export const getTaxSettings = async (): Promise<TaxSettings> => {
  const response = await api.get('/tax');
  return response.data;
};

export const updateTaxSettings = async (settings: Partial<TaxSettings>): Promise<TaxSettings> => {
  const response = await api.put('/tax', settings);
  return response.data;
};
