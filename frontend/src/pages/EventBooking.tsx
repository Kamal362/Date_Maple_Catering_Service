import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createEvent } from '../services/eventService';

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

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      setErrorMessage('Please fill in all required customer information (Name, Email, Phone)');
      setShowErrorModal(true);
      return;
    }
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setErrorMessage('Please provide event date and time');
      setShowErrorModal(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Map form data to backend event model
      const eventData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType.toLowerCase().replace(/\s+/g, '_').replace('/', '_'),
        serviceType: formData.serviceStyle,
        venueType: formData.serviceType === 'indoor' ? 'indoor' : 
                  (formData.hasElectricalOutlets ? 'outdoor_with_power' : 'outdoor_no_power'),
        guestCount: formData.numberOfGuests,
        estimatedBudget: formData.estimatedBudget,
        eventDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        specialRequests: formData.specialRequests
      };
      
      console.log('Submitting event data:', eventData);
      
      // Submit to backend
      const response = await createEvent(eventData);
      
      if (response.success) {
        console.log('Event created successfully:', response.data);
        setShowSuccessModal(true);
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Error submitting event:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit event booking. Please try again.';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // Reset form after successful submission
    setFormData({
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
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-secondary-tea overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary-tea to-dark-tea">
              <h2 className="text-2xl font-heading font-bold text-cream">Book Your Event</h2>
              <p className="text-cream opacity-90 mt-2">Fill out the form below to book our catering services for your special event.</p>
            </div>
            
            <div className="overflow-y-auto max-h-[70vh]">
              <form className="p-6 space-y-8" onSubmit={handleSubmit}>
                {/* Customer Information */}
                <div className="bg-light-tea rounded-xl p-6 border border-secondary-tea">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary-tea flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-primary-tea">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-dark-tea text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-2">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        placeholder="(123) 456-7890"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-dark-tea text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="bg-light-tea rounded-xl p-6 border border-secondary-tea">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary-tea flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-primary-tea">Event Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-2">Event Type *</label>
                      <select 
                        name="eventType"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white transition-all duration-200 hover:border-primary-tea"
                        value={formData.eventType}
                        onChange={handleChange}
                        required
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
                      <label className="block text-dark-tea text-sm font-medium mb-2">Number of Guests *</label>
                      <input
                        type="number"
                        name="numberOfGuests"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        placeholder="50"
                        value={formData.numberOfGuests}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-2">Event Date *</label>
                      <input
                        type="date"
                        name="date"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-2">Start Time *</label>
                      <input
                        type="time"
                        name="startTime"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-2">End Time *</label>
                      <input
                        type="time"
                        name="endTime"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-dark-tea text-sm font-medium mb-2">Event Location *</label>
                    <input
                      type="text"
                      name="location"
                      className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                      placeholder="Full event address"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                {/* Nature of Services */}
                <div className="bg-light-tea rounded-xl p-6 border border-secondary-tea">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary-tea flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-primary-tea">Nature of Services</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-3">Service Type</label>
                      <div className="space-y-3">
                        <div className="flex items-center bg-white rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200 border border-secondary-tea">
                          <input 
                            type="radio" 
                            id="indoor"
                            name="serviceType"
                            className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea" 
                            checked={formData.serviceType === 'indoor'}
                            onChange={handleChange}
                            value="indoor"
                          />
                          <label htmlFor="indoor" className="ml-3 text-dark-tea font-medium">Indoor</label>
                        </div>
                        <div className="flex items-center bg-white rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200 border border-secondary-tea">
                          <input 
                            type="radio" 
                            id="outdoor"
                            name="serviceType"
                            className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea" 
                            checked={formData.serviceType === 'outdoor'}
                            onChange={handleChange}
                            value="outdoor"
                          />
                          <label htmlFor="outdoor" className="ml-3 text-dark-tea font-medium">Outdoor</label>
                        </div>
                        {formData.serviceType === 'outdoor' && (
                          <div className="flex items-center ml-8 bg-white rounded-lg p-3 border border-secondary-tea">
                            <input 
                              type="checkbox" 
                              id="electrical"
                              name="hasElectricalOutlets"
                              className="h-5 w-5 text-primary-tea rounded focus:ring-2 focus:ring-primary-tea border-secondary-tea" 
                              checked={formData.hasElectricalOutlets}
                              onChange={handleChange}
                            />
                            <label htmlFor="electrical" className="ml-3 text-dark-tea font-medium">With Electrical Outlets</label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Catering Details */}
                <div className="bg-light-tea rounded-xl p-6 border border-secondary-tea">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary-tea flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-primary-tea">Catering Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-3">Service Style</label>
                      <div className="space-y-3">
                        <div className="flex items-center bg-white rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200 border border-secondary-tea">
                          <input 
                            type="radio" 
                            id="catered"
                            name="serviceStyle"
                            className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea" 
                            checked={formData.serviceStyle === 'catered'}
                            onChange={handleChange}
                            value="catered"
                          />
                          <label htmlFor="catered" className="ml-3 text-dark-tea font-medium">Catered Event</label>
                        </div>
                        <div className="flex items-center bg-white rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200 border border-secondary-tea">
                          <input 
                            type="radio" 
                            id="vended"
                            name="serviceStyle"
                            className="h-5 w-5 text-primary-tea focus:ring-2 focus:ring-primary-tea" 
                            checked={formData.serviceStyle === 'vended'}
                            onChange={handleChange}
                            value="vended"
                          />
                          <label htmlFor="vended" className="ml-3 text-dark-tea font-medium">Vended Event</label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-dark-tea text-sm font-medium mb-2">Estimated Budget</label>
                      <input
                        type="text"
                        name="estimatedBudget"
                        className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
                        placeholder="$500 - $1000"
                        value={formData.estimatedBudget}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-dark-tea text-sm font-medium mb-2">Special Requests</label>
                    <textarea 
                      name="specialRequests"
                      className="w-full px-4 py-3 border border-secondary-tea rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea resize-none" 
                      rows={4} 
                      placeholder="Any special dietary requirements, themes, or other requests..."
                      value={formData.specialRequests}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-secondary-tea sticky bottom-0 bg-white p-6 -mx-6 -mb-6">
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-primary-tea to-dark-tea hover:shadow-lg text-cream'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        'Submit Booking Request'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-primary-tea mb-3">Booking Request Submitted!</h3>
                  <p className="text-secondary-tea mb-8 leading-relaxed">
                    Thank you for your event booking request! We will contact you shortly to confirm the details and discuss your catering needs.
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={closeSuccessModal}
                      className="px-8 py-3 bg-gradient-to-r from-primary-tea to-dark-tea text-cream rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-cream rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-red-600 mb-3">Submission Error</h3>
                  <p className="text-secondary-tea mb-8 leading-relaxed">
                    {errorMessage}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowErrorModal(false)}
                      className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-700 text-cream rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBooking;