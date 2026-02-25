import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../utils/axios';

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

const EventFlyers: React.FC = () => {
  const [flyers, setFlyers] = useState<EventFlyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlyers = async () => {
      try {
        const response = await api.get('/events/flyers');
        setFlyers(response.data.data);
      } catch (err: any) {
        console.error('Error fetching event flyers:', err);
        setError(err.response?.data?.message || 'Failed to load event flyers');
      } finally {
        setLoading(false);
      }
    };

    fetchFlyers();
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-primary-tea mb-4">Upcoming Events</h2>
            <p className="text-secondary-tea">Check out our upcoming events and exciting happenings!</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-tea"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-heading font-bold text-primary-tea mb-4">Upcoming Events</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (flyers.length === 0) {
    return null; // Don't render anything if there are no flyers
  }

  return (
    <section className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary-tea mb-4">Upcoming Events</h2>
          <p className="text-secondary-tea">Check out our upcoming events and exciting happenings!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flyers.map((flyer) => (
            <div 
              key={flyer._id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-secondary-tea hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img 
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/uploads/${flyer.flyerImage.split('/').pop()}`}
                  alt={flyer.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/400x300?text=${encodeURIComponent(flyer.title)}`;
                  }}
                  className="w-full h-48 object-cover"
                />
                {flyer.eventDate && (
                  <div className="absolute top-4 left-4 bg-primary-tea text-cream px-3 py-1 rounded-lg text-sm font-medium">
                    {format(new Date(flyer.eventDate), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="font-heading font-bold text-xl text-dark-tea mb-2">{flyer.title}</h3>
                <p className="text-secondary-tea mb-4 line-clamp-2">{flyer.description}</p>
                
                {flyer.location && (
                  <div className="flex items-center text-secondary-tea mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {flyer.location}
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm text-secondary-tea">
                  <span className="bg-light-tea px-2 py-1 rounded">Priority: {flyer.priority}</span>
                  <span>Added: {format(new Date(flyer.createdAt), 'MMM d')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventFlyers;