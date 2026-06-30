import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEvents } from '../services/eventService';
import { Event } from '../services/eventService';
import api from '../utils/axios';
import { format } from 'date-fns';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';

interface EventFlyer {
  _id: string;
  title: string;
  description: string;
  flyerImage: string;
  eventDate: string;
  location: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [flyers, setFlyers] = useState<EventFlyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [flyersError, setFlyersError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchPublicEvents(),
      fetchFlyers(),
    ]);
    setLoading(false);
  };

  const fetchPublicEvents = async () => {
    try {
      const data = await getPublicEvents();
      setEvents(data);
      setEventsError('');
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setEventsError('Failed to load event bookings.');
    }
  };

  const fetchFlyers = async () => {
    try {
      const response = await api.get('/events/flyers');
      setFlyers(response.data.data || []);
      setFlyersError('');
    } catch (err: any) {
      console.error('Error fetching event flyers:', err);
      setFlyersError('Failed to load event flyers.');
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
      <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-tea border-t-transparent mx-auto"></div>
          <p className="mt-4 text-dark-tea dark:text-gray-300">Loading events...</p>
        </div>
      </div>
    );
  }

  const hasFlyers = flyers.length > 0;
  const hasEvents = events.length > 0;
  const hasAnyError = eventsError || flyersError;
  const hasAnyContent = hasFlyers || hasEvents;

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <PageHero 
        title="Our Events" 
        subtitle="Discover the memorable events we've had the privilege to cater. From intimate gatherings to grand celebrations."
        height="sm"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error Messages */}
        {hasAnyError && !hasAnyContent && (
          <ScrollReveal direction="up">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-8 text-center">
              {eventsError && flyersError 
                ? 'Failed to load events. Please try again later.' 
                : eventsError || flyersError}
              <button 
                onClick={fetchAllData}
                className="ml-4 underline text-primary-tea hover:text-dark-tea font-medium"
              >
                Retry
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Event Flyers Section */}
        {hasFlyers && (
          <ScrollReveal direction="up">
            <div className="mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-6 flex items-center">
                <svg className="w-7 h-7 mr-2 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Upcoming Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {flyers.map((flyer) => (
                  <div 
                    key={flyer._id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 card-elevated group"
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/uploads/${flyer.flyerImage.split('/').pop()}`}
                        alt={flyer.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://placehold.co/400x300?text=${encodeURIComponent(flyer.title)}`;
                        }}
                        className="w-full h-48 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {flyer.eventDate && (
                        <div className="absolute top-4 left-4 bg-primary-tea text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                          {format(new Date(flyer.eventDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="p-5 sm:p-6">
                      <h3 className="font-heading font-bold text-lg sm:text-xl text-dark-tea dark:text-gray-200 mb-2">{flyer.title}</h3>
                      <p className="text-secondary-tea dark:text-gray-400 mb-4 line-clamp-2 text-sm sm:text-base">{flyer.description}</p>
                      
                      {flyer.location && (
                        <div className="flex items-center text-secondary-tea dark:text-gray-400 text-sm">
                          <svg className="w-4 h-4 mr-2 text-primary-tea flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{flyer.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Event Bookings Section */}
        {hasEvents && (
          <ScrollReveal direction="up" delay={100}>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-6">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
              {events.map((event) => (
                <div 
                  key={event._id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden hover:shadow-xl transition-all duration-300 card-elevated"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-tea/10 dark:bg-primary-tea/20 text-primary-tea">
                        {event.eventType}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {event.status === 'completed' ? 'Completed' : 'Confirmed'}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg sm:text-xl text-dark-tea dark:text-gray-200 mb-3">
                      {event.customer?.firstName} {event.customer?.lastName}'s Event
                    </h3>
                    
                    <div className="space-y-2 text-secondary-tea dark:text-gray-400 text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary-tea flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-primary-tea flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      {event.guestCount && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-primary-tea flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </ScrollReveal>
        )}

        {/* No Content State */}
        {!hasAnyContent && !hasAnyError && (
          <ScrollReveal direction="up">
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-soft">
              <svg className="w-16 h-16 text-secondary-tea dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-heading font-bold text-dark-tea dark:text-gray-200 mb-2">No Events Yet</h3>
              <p className="text-secondary-tea dark:text-gray-400 mb-6">Check back soon to see our upcoming events!</p>
              <Link 
                to="/event-booking" 
                className="btn-primary inline-flex items-center"
              >
                Book Your Event
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center bg-gradient-to-br from-primary-tea to-dark-tea rounded-2xl p-6 sm:p-8 lg:p-10 text-white mt-6 sm:mt-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4">Want to Create Your Own Event?</h2>
            <p className="text-base sm:text-lg mb-5 sm:mb-6 opacity-90 max-w-xl mx-auto">
              Let us help you make your next celebration unforgettable.
            </p>
            <Link 
              to="/event-booking" 
              className="inline-flex items-center px-6 sm:px-8 py-3 border-2 border-white text-base font-medium rounded-xl text-white hover:bg-white hover:text-primary-tea transition-all duration-300 btn-glow"
            >
              Book Your Event Now
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Events;
