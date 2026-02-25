import React from 'react';
// About page component

const About: React.FC = () => {
  // Statistics data
  const stats = [
    { value: "36546", label: "Coffee Served" },
    { value: "28", label: "Type of Coffees" },
    { value: "12", label: "Team Members" }
  ];

  // Values data
  const values = [
    {
      title: "Quality",
      description: "We never compromise on quality, sourcing the finest ingredients and maintaining rigorous standards in everything we create.",
      icon: (
        <svg className="w-8 h-8 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      )
    },
    {
      title: "Passion",
      description: "Our team approaches every dish and beverage with genuine enthusiasm and creative flair, ensuring each creation is made with love.",
      icon: (
        <svg className="w-8 h-8 text-accent-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
      )
    },
    {
      title: "Community",
      description: "We believe in fostering connections and bringing people together through shared meals and memorable experiences.",
      icon: (
        <svg className="w-8 h-8 text-secondary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="section-padding bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary-tea">Our Story</h1>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-xl text-dark-tea max-w-3xl mx-auto">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam aliquyam erat, sed diam voluptua. At vero.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-6 text-primary-tea">About Coffee Shop</h2>
            <p className="text-dark-tea mb-6">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
            </p>
            <p className="text-dark-tea mb-6">
              Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </p>
            
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary-tea">{stat.value}</h3>
                  <p className="text-dark-tea">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Date&Maple Café" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center text-primary-tea">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center p-8">
                <div className="w-16 h-16 bg-primary-tea bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-heading font-semibold mb-4">{value.title}</h3>
                <p className="text-dark-tea">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-8">
          <h2 className="text-3xl font-heading font-bold mb-6 text-center text-primary-tea">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-light-tea">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Sarah Johnson" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-heading font-semibold">Sarah Johnson</h3>
              <p className="text-accent-tea mb-2">Founder & Head Chef</p>
              <p className="text-dark-tea">
                With over 15 years of culinary experience, Sarah brings her passion for innovative flavors to every creation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-light-tea">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Michael Chen" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-heading font-semibold">Michael Chen</h3>
              <p className="text-accent-tea mb-2">Operations Manager</p>
              <p className="text-dark-tea">
                Michael ensures seamless operations and exceptional service for all our catering events.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-light-tea">
                <img 
                  src="https://randomuser.me/api/portraits/women/68.jpg" 
                  alt="Emma Rodriguez" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-heading font-semibold">Emma Rodriguez</h3>
              <p className="text-accent-tea mb-2">Pastry Chef</p>
              <p className="text-dark-tea">
                Emma's artistic touch and precision make our pastries and desserts truly special.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;