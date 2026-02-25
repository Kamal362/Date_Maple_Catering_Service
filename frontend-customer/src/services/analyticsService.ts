import axios from '../utils/axios';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalEvents: number;
  revenueTrend: RevenuePoint[];
  popularItems: PopularItem[];
  orderStatusDistribution: StatusDistribution[];
  salesByCategory: CategorySales[];
  peakHours: PeakHour[];
  customerDemographics: DemographicData;
}

export interface RevenuePoint {
  date: string;
  amount: number;
}

export interface PopularItem {
  name: string;
  salesCount: number;
  revenue: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface CategorySales {
  category: string;
  sales: number;
  revenue: number;
}

export interface PeakHour {
  hour: number;
  orderCount: number;
}

export interface DemographicData {
  ageGroups: AgeGroup[];
  genderDistribution: GenderDistribution[];
}

export interface AgeGroup {
  range: string;
  count: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
}

// Get comprehensive analytics data
export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const response = await axios.get('/admin/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Get revenue trend data
export const getRevenueTrend = async (period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<RevenuePoint[]> => {
  try {
    const response = await axios.get(`/admin/analytics/revenue-trend?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    throw error;
  }
};

// Get popular menu items
export const getPopularItems = async (limit: number = 10): Promise<PopularItem[]> => {
  try {
    const response = await axios.get(`/admin/analytics/popular-items?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular items:', error);
    throw error;
  }
};

// Get sales by category
export const getSalesByCategory = async (): Promise<CategorySales[]> => {
  try {
    const response = await axios.get('/admin/analytics/sales-by-category');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    throw error;
  }
};

// Get peak hours data
export const getPeakHours = async (): Promise<PeakHour[]> => {
  try {
    const response = await axios.get('/admin/analytics/peak-hours');
    return response.data;
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    throw error;
  }
};

// Get customer demographics
export const getCustomerDemographics = async (): Promise<DemographicData> => {
  try {
    const response = await axios.get('/admin/analytics/demographics');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer demographics:', error);
    throw error;
  }
};

// Get real-time dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await axios.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Mock data generators for demonstration
export const generateMockAnalyticsData = (): AnalyticsData => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return {
    totalRevenue: 12540.75,
    totalOrders: 342,
    totalCustomers: 287,
    totalEvents: 45,
    revenueTrend: dates.map(date => ({
      date,
      amount: Math.floor(Math.random() * 1000) + 200
    })),
    popularItems: [
      { name: 'Maple Latte', salesCount: 127, revenue: 895.50 },
      { name: 'Caramel Macchiato', salesCount: 98, revenue: 689.25 },
      { name: 'Chocolate Croissant', salesCount: 84, revenue: 420.00 },
      { name: 'Avocado Toast', salesCount: 76, revenue: 380.00 },
      { name: 'Green Tea', salesCount: 63, revenue: 252.00 }
    ],
    orderStatusDistribution: [
      { status: 'completed', count: 280 },
      { status: 'processing', count: 32 },
      { status: 'pending', count: 18 },
      { status: 'cancelled', count: 12 }
    ],
    salesByCategory: [
      { category: 'Drinks', sales: 205, revenue: 4120.50 },
      { category: 'Food', sales: 112, revenue: 2800.00 },
      { category: 'Pastries', sales: 85, revenue: 1700.00 },
      { category: 'Catering', sales: 40, revenue: 3920.25 }
    ],
    peakHours: Array.from({ length: 12 }, (_, i) => ({
      hour: i + 8,
      orderCount: Math.floor(Math.random() * 30) + 5
    })),
    customerDemographics: {
      ageGroups: [
        { range: '18-25', count: 78 },
        { range: '26-35', count: 124 },
        { range: '36-45', count: 65 },
        { range: '46-55', count: 28 },
        { range: '55+', count: 12 }
      ],
      genderDistribution: [
        { gender: 'Male', count: 142 },
        { gender: 'Female', count: 168 },
        { gender: 'Other', count: 15 }
      ]
    }
  };
};