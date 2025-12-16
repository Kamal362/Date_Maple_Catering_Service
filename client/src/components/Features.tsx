import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="w-16 h-16 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Premium Ingredients",
      description: "We source only the finest ingredients to ensure exceptional taste in every bite and sip.",
      number: "01"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Fresh Daily",
      description: "Our menu items are prepared fresh daily to guarantee the highest quality and taste.",
      number: "02"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Expert Chefs",
      description: "Our team of skilled chefs brings creativity and expertise to every dish they prepare.",
      number: "03"
    }
  ];

  return (
    <section className="section-padding bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-tea">Why Choose Date&Maple?</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-lg text-dark-tea max-w-2xl mx-auto">
            We are committed to providing an exceptional dining experience with quality, freshness, and passion.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-accent-tea group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-cream rounded-full group-hover:bg-accent-tea transition duration-300">
                  {feature.icon}
                </div>
                <span className="text-5xl font-heading font-bold text-light-tea">{feature.number}</span>
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-4 text-primary-tea">{feature.title}</h3>
              <p className="text-dark-tea mb-4">{feature.description}</p>
              <button className="text-accent-tea font-medium flex items-center group-hover:text-primary-tea transition duration-300">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;