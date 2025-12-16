import React from 'react';
import { Link } from 'react-router-dom';

const MenuHighlights: React.FC = () => {
  const menuItems = [
    {
      name: "Americano",
      description: "Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.",
      price: "$2.5",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      name: "Hot Chocolate",
      description: "Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.",
      price: "$7",
      image: "https://images.unsplash.com/photo-1542990257-7c0e9f460f53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1168&q=80"
    },
    {
      name: "Double Americano",
      description: "Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.",
      price: "$6",
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    },
    {
      name: "Latte",
      description: "Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.",
      price: "$6",
      image: "https://images.unsplash.com/photo-1561049951-9a3e4a8a5c9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    }
  ];

  return (
    <section className="section-padding bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-tea">Check Out Our Signature Menu</h2>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-lg text-dark-tea max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          </p>
          <Link to="/menu" className="btn-primary inline-block mt-8 px-8 py-3 text-lg font-semibold rounded-none hover:bg-dark-tea transition duration-300">
            View Menu
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:-translate-y-2">
              <div className="h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-tea to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-semibold">{item.name}</h3>
                  <span className="text-lg font-bold text-gold">{item.price}</span>
                </div>
                <p className="text-light-tea mb-4">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuHighlights;