import axiosInstance from '../utils/axios';

export interface Inquiry {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all inquiries (Admin only)
export const getAllInquiries = async (): Promise<Inquiry[]> => {
  const response = await axiosInstance.get('/contact');
  return response.data.data;
};

// Get single inquiry (Admin only)
export const getInquiry = async (id: string): Promise<Inquiry> => {
  const response = await axiosInstance.get(`/contact/${id}`);
  return response.data.data;
};

// Update inquiry status (Admin only)
export const updateInquiry = async (id: string, data: { status?: string; notes?: string }): Promise<Inquiry> => {
  const response = await axiosInstance.put(`/contact/${id}`, data);
  return response.data.data;
};

// Delete inquiry (Admin only)
export const deleteInquiry = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/contact/${id}`);
};
