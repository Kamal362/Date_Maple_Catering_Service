import axios from 'axios';

const API_URL = '/api/events';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Event interface
export interface Event {
  _id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  eventType: string;
  serviceType: string;
  venueType: string;
  guestCount: string;
  estimatedBudget: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Create a new event
export const createEvent = async (eventData: any): Promise<{success: boolean, data?: Event, message?: string}> => {
  try {
    const response = await apiClient.post('/', eventData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get all events (Admin only)
export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await apiClient.get('/');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get events for logged in user
export const getMyEvents = async (): Promise<Event[]> => {
  try {
    const response = await apiClient.get('/myevents');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching my events:', error);
    throw error;
  }
};

// Get single event
export const getEvent = async (id: string): Promise<Event> => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Update event status (Admin only)
export const updateEventStatus = async (id: string, status: string): Promise<Event> => {
  try {
    const response = await apiClient.put(`/${id}/status`, { status });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

// Update event (User only - own events)
export const updateEvent = async (id: string, eventData: any): Promise<Event> => {
  try {
    const response = await apiClient.put(`/${id}`, eventData);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event (User only - own events)
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/${id}`);
  } catch (error: any) {
    console.error('Error deleting event:', error);
    throw error;
  }
};