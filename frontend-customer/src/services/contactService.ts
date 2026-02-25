import api from '../utils/axios';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const submitContactForm = async (formData: ContactFormData): Promise<any> => {
  try {
    const response = await api.post('/contact', formData);
    return response.data;
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    throw error;
  }
};