import React, { useState } from 'react';
// Contact page component
import { useToast } from '../context/ToastContext';
import { submitContactForm } from '../services/contactService';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await submitContactForm(formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary-tea">Get In Touch</h1>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-xl text-dark-tea max-w-3xl mx-auto">
            Lorem ipsum dolor sit amdi scing elitr, sed diam nonumy eirmo tem invidunt ut labore etdolo magna aliquyam erat.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="card p-8 mb-8 bg-white">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-primary-tea">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary-tea bg-opacity-10 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Address</h3>
                    <p className="text-dark-tea">123 Coffee Street, Tea City</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-accent-tea bg-opacity-10 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Phone</h3>
                    <p className="text-dark-tea">(123) 456-7890</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-secondary-tea bg-opacity-10 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-secondary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Email</h3>
                    <p className="text-dark-tea">info@datemaple.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-dark-tea bg-opacity-10 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-dark-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">Opening Hours</h3>
                    <div className="space-y-1">
                      <p className="text-dark-tea flex justify-between"><span>Mon-Fri:</span> <span>08.00 A.M - 10.00 P.M</span></p>
                      <p className="text-dark-tea flex justify-between"><span>Saturday:</span> <span>08.00 A.M - 02.00 P.M</span></p>
                      <p className="text-dark-tea flex justify-between"><span>Sunday:</span> <span>Closed</span></p>
                      <p className="text-dark-tea flex justify-between"><span>Half-Holidays:</span> <span>08.00 A.M - 02.00 P.M</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-xl h-80">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133404672!2d-73.987574724525!3d40.758028871388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1690000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
          </div>
          
          <div>
            <div className="card p-8 bg-white">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-primary-tea">Send Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-dark-tea mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream"
                    placeholder="Your Name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-dark-tea mb-2">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream"
                    placeholder="Your Email"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-dark-tea mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream"
                    placeholder="Subject"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-dark-tea mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-secondary-tea rounded-md focus:outline-none focus:ring-2 focus:ring-primary-tea bg-cream"
                    placeholder="Message"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary w-full py-3 rounded-none hover:bg-dark-tea transition duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : 'SEND MESSAGE'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;