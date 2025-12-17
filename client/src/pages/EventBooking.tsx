import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EventBooking: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: 'Baby Shower/Aqiqah',
    numberOfGuests: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    serviceType: 'indoor',
    hasElectricalOutlets: false,
    serviceStyle: 'catered',
    estimatedBudget: '',
    specialRequests: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event booking submitted:', formData);
    alert('Thank you for your event booking request! We will contact you shortly.');
  };

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/menu" className="text-primary-tea hover:text-dark-tea mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <h1 className="text-4xl font-heading font-bold text-primary-tea">Book an Event</h1>
        </div>
        
        <div className="card p-6 max-w-4xl mx-auto">
          <p className="text-dark-tea mb-6">Fill out the form below to book our catering services for your special event.</p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Customer Information */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-primary-tea">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-tea mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-dark-tea mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-dark-tea mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Event Details */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-primary-tea">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-dark-tea mb-2">Event Type</label>
                  <select 
                    name="eventType"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white"
                    value={formData.eventType}
                    onChange={handleChange}
                  >
                    <option value="Baby Shower/Aqiqah">Baby Shower/Aqiqah</option>
                    <option value="General Party">General Party</option>
                    <option value="Bridal Party">Bridal Party</option>
                    <option value="Business Event">Business Event</option>
                    <option value="Community Event">Community Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-tea mb-2">Expected Number of Guests</label>
                  <input
                    type="number"
                    name="numberOfGuests"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    placeholder="50"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-dark-tea mb-2">Event Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-dark-tea mb-2">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-dark-tea mb-2">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-dark-tea mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                  placeholder="Event address"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Nature of Services */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-primary-tea">Nature of Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-dark-tea mb-2">Service Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="indoor"
                        name="serviceType"
                        className="mr-2" 
                        checked={formData.serviceType === 'indoor'}
                        onChange={handleChange}
                        value="indoor"
                      />
                      <label htmlFor="indoor" className="text-dark-tea">Indoor</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="outdoor"
                        name="serviceType"
                        className="mr-2" 
                        checked={formData.serviceType === 'outdoor'}
                        onChange={handleChange}
                        value="outdoor"
                      />
                      <label htmlFor="outdoor" className="text-dark-tea">Outdoor</label>
                    </div>
                    <div className="flex items-center ml-6">
                      <input 
                        type="checkbox" 
                        id="electrical"
                        name="hasElectricalOutlets"
                        className="mr-2" 
                        checked={formData.hasElectricalOutlets}
                        onChange={handleChange}
                      />
                      <label htmlFor="electrical" className="text-dark-tea">With Electrical Outlets</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Catering Details */}
            <div>
              <h3 className="text-xl font-heading font-semibold mb-4 text-primary-tea">Catering Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-dark-tea mb-2">Service Style</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="catered"
                        name="serviceStyle"
                        className="mr-2" 
                        checked={formData.serviceStyle === 'catered'}
                        onChange={handleChange}
                        value="catered"
                      />
                      <label htmlFor="catered" className="text-dark-tea">Catered Event</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="vended"
                        name="serviceStyle"
                        className="mr-2" 
                        checked={formData.serviceStyle === 'vended'}
                        onChange={handleChange}
                        value="vended"
                      />
                      <label htmlFor="vended" className="text-dark-tea">Vended Event</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-dark-tea mb-2">Estimated Budget</label>
                  <input
                    type="text"
                    name="estimatedBudget"
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea"
                    placeholder="$500 - $1000"
                    value={formData.estimatedBudget}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-dark-tea mb-2">Special Requests</label>
                <textarea 
                  name="specialRequests"
                  className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea" 
                  rows={4} 
                  placeholder="Any special dietary requirements, themes, or other requests..."
                  value={formData.specialRequests}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button type="submit" className="btn-primary px-8 py-3">
                Submit Booking Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventBooking;