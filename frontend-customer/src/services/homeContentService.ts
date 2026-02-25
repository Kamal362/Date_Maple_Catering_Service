import axiosInstance from '../utils/axios';

export interface HomePageContent {
  _id?: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: Array<{
    name?: string;
    title?: string;
    role?: string;
    description?: string;
    price?: string;
    image?: string;
    alt?: string;
    icon?: string;
  }>;
  settings?: Record<string, string | number | boolean>;
  createdAt?: string;
  updatedAt?: string;
}

// Get all home page content
export const getAllHomePageContent = async (): Promise<HomePageContent[]> => {
  const response = await axiosInstance.get('/home-content');
  return response.data.data;
};

// Get home page content by section
export const getHomePageContentBySection = async (section: string): Promise<HomePageContent> => {
  const response = await axiosInstance.get(`/home-content/${section}`);
  return response.data.data;
};

// Create or update home page content (Admin only)
export const createOrUpdateHomePageContent = async (content: HomePageContent): Promise<HomePageContent> => {
  const response = await axiosInstance.post('/home-content', content);
  return response.data.data;
};

// Delete home page content (Admin only)
export const deleteHomePageContent = async (section: string): Promise<void> => {
  const response = await axiosInstance.delete(`/api/home-content/${section}`);
  return response.data.data;
};