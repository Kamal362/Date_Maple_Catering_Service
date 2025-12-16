import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { MenuItem, MenuCategory } from '../types/menu';

const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('drinks');
  const { addToCart } = useCart();
  
  const menuCategories: MenuCategory[] = [
    {
      id: 'drinks',
      name: 'Drinks',
      items: [
        { 
          id: '1',
          name: 'Americano', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 2.5,
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
        },
        { 
          id: '2',
          name: 'Hot Chocolate', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 7,
          image: 'https://images.unsplash.com/photo-1542990257-7c0e9f460f53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1168&q=80'
        },
        { 
          id: '3',
          name: 'Double Americano', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 6,
          image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        },
        { 
          id: '4',
          name: 'Latte', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 6,
          image: 'https://images.unsplash.com/photo-1561049951-9a3e4a8a5c9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        },
        { 
          id: '5',
          name: 'Long Black', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 4,
          image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        },
        { 
          id: '6',
          name: 'Cappuccino', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 5,
          image: 'https://images.unsplash.com/photo-1561049951-9a3e4a8a5c9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        }
      ]
    },
    {
      id: 'food',
      name: 'Food',
      items: [
        { 
          id: '7',
          name: 'Cinnamon Roll', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 4.50,
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        },
        { 
          id: '8',
          name: 'Chocolate Cake', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 5.50,
          image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
        },
        { 
          id: '9',
          name: 'Croissant', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 3.50,
          image: 'https://images.unsplash.com/photo-1530846675858-dc63235ee1b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
        },
        { 
          id: '10',
          name: 'Blueberry Muffin', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 4.00,
          image: 'https://images.unsplash.com/photo-1619443023442-2c8bd10a3944?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
        }
      ]
    },
    {
      id: 'specials',
      name: 'Specials',
      items: [
        { 
          id: '11',
          name: 'Salted Date Caramel Latte', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 6.50,
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        },
        { 
          id: '12',
          name: 'Banana Pudding Matcha Latte', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 7.00,
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        },
        { 
          id: '13',
          name: 'Horchata Matcha', 
          description: 'Lorem ipsum dolor sit amet, cosadipscing elitr, sed diam nonumy eirmod.', 
          price: 7.50,
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80'
        }
      ]
    }
  ];

  const activeMenu = menuCategories.find(category => category.id === activeCategory) || menuCategories[0];

  return (
    <div className="section-padding bg-cream py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary-tea">Menu</h1>
          <div className="w-20 h-1 bg-accent-tea mx-auto mb-6"></div>
          <p className="text-xl text-dark-tea max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          </p>
        </div>
        
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 bg-white p-2 rounded-lg shadow-md border border-light-tea">
            {menuCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-md transition-all duration-300 ${
                  activeCategory === category.id 
                    ? 'bg-primary-tea text-cream' 
                    : 'text-dark-tea hover:bg-light-tea'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeMenu.items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-lg transform transition duration-500 hover:-translate-y-2 bg-white">
              <div className="h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-tea to-transparent opacity-0 group-hover:opacity-80 transition duration-300"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-semibold text-primary-tea">{item.name}</h3>
                  <span className="text-lg font-bold text-gold">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-dark-tea mb-4">{item.description}</p>
                <button 
                  onClick={() => addToCart(item)}
                  className="btn-primary w-full rounded-none hover:bg-dark-tea transition duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;