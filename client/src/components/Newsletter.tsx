import React, { useState } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing email:', email);
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <section className="section-padding bg-primary-tea text-cream py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Subscribe Our Newsletter</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-xl mb-8 text-light-tea">
            To recieve monthly updates
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-cream rounded-lg p-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-grow px-6 py-4 rounded-md text-dark-tea focus:outline-none focus:ring-2 focus:ring-accent-tea bg-white"
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap px-8 py-4 rounded-md">
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;