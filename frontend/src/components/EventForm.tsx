import React, { useState } from 'react';

interface EventFormProps {
  event?: any;
  onSave: (eventData: any) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: event?.customerName || '',
    customerEmail: event?.customerEmail || '',
    customerPhone: event?.customerPhone || '',
    eventType: event?.eventType || 'Baby Shower/Aqiqah',
    numberOfGuests: event?.numberOfGuests || '',
    location: event?.location || '',
    date: event?.date || '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    serviceType: event?.serviceType || 'indoor',
    hasElectricalOutlets: event?.hasElectricalOutlets || false,
    serviceStyle: event?.serviceStyle || 'catered',
    estimatedBudget: event?.estimatedBudget || '',
    specialRequests: event?.specialRequests || '',
    status: event?.status || 'pending'
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
    onSave(formData);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Customer Information */}
      <div>
        <h3 className="text-xl font-heading font-semibold mb-4 text-primary-tea">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              name="customerName"
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder="John Doe"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              name="customerEmail"
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder="john@example.com"
              value={formData.customerEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              name="customerPhone"
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder="(123) 456-7890"
              value={formData.customerPhone}
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
            <label className="block text-dark-tea text-sm font-medium mb-2">Event Type *</label>
            <select 
              name="eventType"
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white transition-all duration-200 hover:border-primary-tea"
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
            <label className="block text-dark-tea text-sm font-medium mb-2">Expected Number of Guests *</label>
            <input
              type="number"
              name="numberOfGuests"
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              placeholder="50"
              value={formData.numberOfGuests}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-dark-tea text-sm font-medium mb-2">Event Date *</label>
          <input
            type="date"
            name="date"
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Start Time *</label>
            <input
              type="time"
              name="startTime"
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
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
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-dark-tea text-sm font-medium mb-2">Location *</label>
          <input
            type="text"
            name="location"
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
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
            <label className="block text-dark-tea text-sm font-medium mb-2">Service Type</label>
            <div className="space-y-3">
              <div className="flex items-center bg-light-tea rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200">
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
              <div className="flex items-center bg-light-tea rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200">
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
                <div className="flex items-center ml-8 bg-light-tea rounded-lg p-3">
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
      <div>
        <h3 className="text-xl font-heading font-semibold mb-4 text-primary-tea">Catering Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-dark-tea text-sm font-medium mb-2">Service Style</label>
            <div className="space-y-3">
              <div className="flex items-center bg-light-tea rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200">
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
              <div className="flex items-center bg-light-tea rounded-lg p-3 hover:bg-secondary-tea hover:bg-opacity-10 transition-all duration-200">
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
              className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea"
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
            className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea transition-all duration-200 hover:border-primary-tea resize-none" 
            rows={4} 
            placeholder="Any special dietary requirements, themes, or other requests..."
            value={formData.specialRequests}
            onChange={handleChange}
          ></textarea>
        </div>
      </div>

      {/* Event Status */}
      <div>
        <label className="block text-dark-tea text-sm font-medium mb-2">Event Status</label>
        <select 
          name="status"
          className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-white transition-all duration-200 hover:border-primary-tea"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-secondary-tea">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-secondary-tea text-dark-tea rounded-md hover:bg-secondary-tea hover:text-cream transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-6 py-3 bg-primary-tea text-cream rounded-md hover:bg-accent-tea transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          {event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;