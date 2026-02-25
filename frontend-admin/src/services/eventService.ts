import api from '../utils/axios';

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

// Get all events (Admin only)
export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/events');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get single event
export const getEvent = async (id: string): Promise<Event> => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Update event status (Admin only)
export const updateEventStatus = async (id: string, status: string): Promise<Event> => {
  try {
    const response = await api.put(`/events/${id}/status`, { status });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (id: string, eventData: any): Promise<Event> => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await api.delete(`/events/${id}`);
  } catch (error: any) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
