import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '../services/eventService';
import { Event } from '../services/eventService';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getPublicEvents();
      setEvents(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Events</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the memorable events we've had the privilege to cater. 
            From intimate gatherings to grand celebrations, we bring excellence to every occasion.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Events Grid */}
        {events.length === 0 && !error ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-6">Check back soon to see our upcoming events!</p>
            <Link 
              to="/event-booking" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-tea hover:bg-dark-tea"
            >
              Book Your Event
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event) => (
                <div 
                  key={event._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    {/* Event Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-tea/10 text-primary-tea">
                        {event.eventType}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.status === 'completed' ? 'Completed' : 'Confirmed'}
                      </span>
                    </div>

                    {/* Event Details */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.customer?.firstName} {event.customer?.lastName}'s Event
                    </h3>
                    
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.guestCount && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{event.guestCount} Guests</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center bg-primary-tea rounded-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Want to Create Your Own Event?</h2>
              <p className="text-lg mb-6 opacity-90">
                Let us help you make your next celebration unforgettable.
              </p>
              <Link 
                to="/event-booking" 
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-tea transition-colors duration-200"
              >
                Book Your Event Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
