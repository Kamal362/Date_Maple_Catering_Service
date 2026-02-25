import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getEvents, deleteEvent, updateEventStatus } from '../services/eventService';
import api from '../utils/axios';
import AdminEventForm from '../components/AdminEventForm';

interface Event {
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

interface EventFlyer {
  _id?: string;
  title: string;
  description: string;
  flyerImage?: string;
  eventDate: string;
  location: string;
  priority?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventFlyers, setEventFlyers] = useState<EventFlyer[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'flyers'>('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [showAdminEventForm, setShowAdminEventForm] = useState(false);
  const [editingFlyer, setEditingFlyer] = useState<EventFlyer | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEvents(), fetchEventFlyers()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchEvents = async () => {
    try {
      setError('');
      
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
    }
  };

  const fetchEventFlyers = async () => {
    try {
      setError('');
      
      const response = await api.get('/events/flyers');
      setEventFlyers(response.data.data);
    } catch (err: any) {
      console.error('Error fetching event flyers:', err);
      setError(err.response?.data?.message || 'Failed to load event flyers');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await deleteEvent(selectedEvent._id);
      setEvents(events.filter(event => event._id !== selectedEvent._id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleDeleteEventFlyer = async (flyerId: string) => {
    try {
      await api.delete(`/events/flyers/${flyerId}`);
      setEventFlyers(eventFlyers.filter(flyer => flyer._id !== flyerId));
      setError('');
    } catch (err: any) {
      console.error('Error deleting event flyer:', err);
      setError(err.response?.data?.message || 'Failed to delete event flyer');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedEvent || !newStatus) return;
    
    try {
      const updatedEvent = await updateEventStatus(selectedEvent._id, newStatus);
      
      setEvents(events.map(event => 
        event._id === selectedEvent._id 
          ? { ...event, status: updatedEvent.status }
          : event
      ));
      
      setShowStatusModal(false);
      setSelectedEvent(null);
      setNewStatus('');
    } catch (err: any) {
      console.error('Error updating event status:', err);
      setError(err.response?.data?.message || 'Failed to update event status');
    }
  };

  const handleEditFlyer = (flyer: EventFlyer) => {
    setEditingFlyer(flyer);
    setShowAdminEventForm(true);
  };

  const handleSaveFlyer = (flyerData: EventFlyer) => {
    if (editingFlyer) {
      // Update existing flyer
      setEventFlyers(eventFlyers.map(flyer => 
        flyer._id === flyerData._id ? flyerData : flyer
      ));
    } else {
      // Add new flyer
      setEventFlyers([...eventFlyers, flyerData]);
    }
    setShowAdminEventForm(false);
    setEditingFlyer(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const eventTypes: Record<string, string> = {
      'baby_shower': 'Baby Shower/Aqiqah',
      'general_party': 'General Party',
      'bridal_party': 'Bridal Party',
      'business_event': 'Business Event',
      'community_event': 'Community Event',
      'other': 'Other'
    };
    return eventTypes[eventType] || eventType;
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (event.customer?.firstName?.toLowerCase() || '').includes(searchLower) ||
      (event.customer?.lastName?.toLowerCase() || '').includes(searchLower) ||
      (event.customer?.email?.toLowerCase() || '').includes(searchLower) ||
      (event._id?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesEventType = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
    
    return matchesSearch && matchesStatus && matchesEventType;
  });

  const filteredEventFlyers = eventFlyers.filter(flyer => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (flyer.title?.toLowerCase() || '').includes(searchLower) ||
      (flyer.description?.toLowerCase() || '').includes(searchLower) ||
      (flyer.location?.toLowerCase() || '').includes(searchLower) ||
      (flyer._id?.toLowerCase() || '').includes(searchLower);
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="section-padding bg-cream min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto mb-4"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding bg-cream min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary-tea">Event Management</h1>
            <p className="text-secondary-tea mt-2">Manage event bookings and promotional flyers</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setEditingFlyer(null);
                setShowAdminEventForm(true);
              }}
              className="px-4 py-2 bg-primary-tea text-cream rounded-md hover:bg-dark-tea transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Event Flyer
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  if (activeTab === 'bookings') {
                    await fetchEvents();
                  } else {
                    await fetchEventFlyers();
                  }
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-secondary-tea text-dark-tea rounded-md hover:bg-primary-tea hover:text-cream transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-secondary-tea mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-primary-tea text-primary-tea bg-light-tea'
                : 'border-transparent text-secondary-tea hover:text-dark-tea'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            Event Bookings
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'flyers'
                ? 'border-primary-tea text-primary-tea bg-light-tea'
                : 'border-transparent text-secondary-tea hover:text-dark-tea'
            }`}
            onClick={() => setActiveTab('flyers')}
          >
            Event Flyers
          </button>
        </div>

        {/* Admin Event Form Modal */}
        {showAdminEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-heading font-bold text-primary-tea">
                    {editingFlyer ? 'Edit Event Flyer' : 'Add New Event Flyer'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAdminEventForm(false);
                      setEditingFlyer(null);
                    }}
                    className="text-2xl text-secondary-tea hover:text-dark-tea"
                  >
                    &times;
                  </button>
                </div>
                <AdminEventForm
                  event={editingFlyer || undefined}
                  onSave={handleSaveFlyer}
                  onCancel={() => {
                    setShowAdminEventForm(false);
                    setEditingFlyer(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Conditional rendering based on active tab */}
        {activeTab === 'bookings' ? (
          <>
            {/* Booking Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-secondary-tea">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">Search Events</label>
                  <input
                    type="text"
                    placeholder="Search by customer name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">Event Type</label>
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  >
                    <option value="all">All Types</option>
                    <option value="baby_shower">Baby Shower/Aqiqah</option>
                    <option value="general_party">General Party</option>
                    <option value="bridal_party">Bridal Party</option>
                    <option value="business_event">Business Event</option>
                    <option value="community_event">Community Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-xl shadow-lg border border-secondary-tea overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-light-tea">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Event ID</th>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Customer</th>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Type</th>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Guests</th>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-dark-tea">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => (
                        <tr key={event._id} className="border-b border-secondary-tea hover:bg-light-tea transition-colors">
                          <td className="py-4 px-6 font-mono text-sm">
                            {event._id?.slice(-6).toUpperCase() || 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-dark-tea">
                                {event.customer?.firstName || 'N/A'} {event.customer?.lastName || ''}
                              </div>
                              <div className="text-sm text-secondary-tea">
                                {event.customer?.email || 'N/A'}
                              </div>
                              <div className="text-sm text-secondary-tea">
                                {event.customer?.phone || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              <div className="font-medium">{getEventTypeLabel(event.eventType)}</div>
                              <div className="text-secondary-tea capitalize">{event.serviceType}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              <div>{format(new Date(event.eventDate), 'MMM d, yyyy')}</div>
                              <div className="text-secondary-tea">
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            {event.guestCount}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setNewStatus(event.status);
                                  setShowStatusModal(true);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Update Status
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowDeleteModal(true);
                                }}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-secondary-tea">
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-secondary-tea mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <h3 className="text-xl font-heading font-semibold mb-2">No Events Found</h3>
                            <p>No events match your current filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Flyers Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-secondary-tea">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-tea mb-2">Search Event Flyers</label>
                  <input
                    type="text"
                    placeholder="Search by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  />
                </div>
              </div>
            </div>

            {/* Flyers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEventFlyers.length > 0 ? (
                filteredEventFlyers.map((flyer, index) => (
                  <div key={flyer._id || `flyer-${index}`} className="bg-white rounded-xl shadow-lg border border-secondary-tea overflow-hidden">
                    <div className="relative">
                      <img 
                        src={flyer.flyerImage ? `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/uploads/${flyer.flyerImage.split('/').pop()}` : `https://placehold.co/400x300?text=${encodeURIComponent(flyer.title)}`} 
                        alt={flyer.title} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://placehold.co/400x300?text=${encodeURIComponent(flyer.title)}`;
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          flyer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {flyer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-lg text-dark-tea mb-1">{flyer.title}</h3>
                      <p className="text-sm text-secondary-tea mb-2 line-clamp-2">{flyer.description}</p>
                      
                      {flyer.eventDate && (
                        <div className="flex items-center text-sm text-secondary-tea mb-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m-9 4h10m-9 4h10m-9 4h10" />
                          </svg>
                          {format(new Date(flyer.eventDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      
                      {flyer.location && (
                        <div className="flex items-center text-sm text-secondary-tea mb-3">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {flyer.location}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-secondary-tea mb-3">
                        <span>Priority: {flyer.priority || 0}</span>
                        <span>Created: {flyer.createdAt ? format(new Date(flyer.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditFlyer(flyer)}
                          className="flex-1 px-3 py-2 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => flyer._id && handleDeleteEventFlyer(flyer._id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-cream rounded-md hover:bg-red-700 transition-colors text-sm"
                          disabled={!flyer._id}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="bg-white rounded-xl shadow-lg border border-secondary-tea p-12 text-center">
                    <svg className="w-16 h-16 text-secondary-tea mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h3 className="text-xl font-heading font-semibold mb-2">No Event Flyers Found</h3>
                    <p>No event flyers match your current filters</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedEvent && activeTab === 'bookings' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-dark-tea">Delete Event</h3>
                    <p className="text-secondary-tea">Event ID: {selectedEvent._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                  </div>
                </div>
                
                <p className="text-secondary-tea mb-6">
                  Are you sure you want to delete this event? This action cannot be undone and will permanently remove all event data.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-lg hover:bg-secondary-tea hover:text-cream transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-600 text-cream rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedEvent && activeTab === 'bookings' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-dark-tea">Update Event Status</h3>
                    <p className="text-secondary-tea">Event ID: {selectedEvent._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark-tea mb-2">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedEvent(null);
                      setNewStatus('');
                    }}
                    className="px-4 py-2 border border-secondary-tea text-dark-tea rounded-lg hover:bg-secondary-tea hover:text-cream transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-primary-tea text-cream rounded-lg hover:bg-dark-tea transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;