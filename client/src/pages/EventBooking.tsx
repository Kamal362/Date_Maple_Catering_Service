import React, { useState } from 'react';

const EventBooking: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    specialRequests: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your event booking request! We will contact you shortly.');
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      eventType: '',
      eventDate: '',
      guestCount: '',
      specialRequests: ''
    });
  };

  const eventTypes = [
    'Baby Shower',
    'Birthday Party',
    'Wedding Reception',
    'Corporate Event',
    'Anniversary',
    'Holiday Party',
    'Other'
  ];

  const guestCounts = [
    '1-25 guests',
    '26-50 guests',
    '51-100 guests',
    '101-200 guests',
    '200+ guests'
  ];

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary-tea">Event Catering</h1>
            <p className="text-xl text-dark-tea max-w-2xl mx-auto">
              Let us make your special event unforgettable with our exceptional catering services
            </p>
          </div>
          
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-lg font-medium text-dark-tea mb-2">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-lg font-medium text-dark-tea mb-2">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-lg font-medium text-dark-tea mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-lg font-medium text-dark-tea mb-2">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="eventType" className="block text-lg font-medium text-dark-tea mb-2">Event Type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  >
                    <option value="">Select an event type</option>
                    {eventTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="eventDate" className="block text-lg font-medium text-dark-tea mb-2">Event Date</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="guestCount" className="block text-lg font-medium text-dark-tea mb-2">Guest Count</label>
                  <select
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    required
                  >
                    <option value="">Select guest count</option>
                    {guestCounts.map((count, index) => (
                      <option key={index} value={count}>{count}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="specialRequests" className="block text-lg font-medium text-dark-tea mb-2">Special Requests</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  placeholder="Any dietary restrictions, special arrangements, or other requests..."
                ></textarea>
              </div>
              
              <div className="text-center pt-6">
                <button type="submit" className="btn-primary px-8 py-4 text-lg">
                  Submit Booking Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBooking;