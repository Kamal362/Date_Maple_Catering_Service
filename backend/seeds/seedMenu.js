const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

const menuItems = [
  // Drinks
  {
    name: "Americano",
    description: "Rich espresso with hot water, smooth and bold flavor",
    price: 2.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam, perfectly balanced",
    price: 3.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Latte",
    description: "Smooth espresso with steamed milk and light foam",
    price: 4.0,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1561049951-9a3e4a8a5c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    available: true
  },
  {
    name: "Mocha",
    description: "Espresso with chocolate, steamed milk, and whipped cream",
    price: 4.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1578374173705-0a5c2c6e8d8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Espresso",
    description: "Pure, concentrated coffee shot with rich crema",
    price: 2.0,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Hot Chocolate",
    description: "Rich, creamy chocolate with whipped cream and marshmallows",
    price: 3.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1542990257-7c0e9f460f53?ixlib=rb-4.0.3&auto=format&fit=crop&w=1168&q=80",
    available: true
  },
  {
    name: "Iced Coffee",
    description: "Cold brew coffee over ice, refreshing and smooth",
    price: 3.0,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?ixlib=rb-4.0.3&auto=format&fit=crop&w=735&q=80",
    available: true
  },
  {
    name: "Matcha Latte",
    description: "Premium Japanese green tea with steamed milk",
    price: 4.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1536013564743-8e29d0e9a0c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Chai Latte",
    description: "Spiced tea with steamed milk and honey",
    price: 4.0,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1578899952107-9d9d7a6c5d0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Caramel Macchiato",
    description: "Espresso with vanilla, steamed milk, and caramel drizzle",
    price: 4.5,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  
  // Food
  {
    name: "Croissant",
    description: "Buttery, flaky French pastry, freshly baked daily",
    price: 3.0,
    category: "food",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Blueberry Muffin",
    description: "Moist muffin loaded with fresh blueberries",
    price: 3.5,
    category: "food",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Chocolate Chip Cookie",
    description: "Warm, gooey cookie with premium chocolate chips",
    price: 2.5,
    category: "food",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80",
    available: true
  },
  {
    name: "Avocado Toast",
    description: "Smashed avocado on sourdough with cherry tomatoes",
    price: 7.0,
    category: "food",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Bagel with Cream Cheese",
    description: "Fresh bagel with your choice of cream cheese",
    price: 4.0,
    category: "food",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Breakfast Sandwich",
    description: "Egg, cheese, and bacon on English muffin",
    price: 6.5,
    category: "food",
    image: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?ixlib=rb-4.0.3&auto=format&fit=crop&w=735&q=80",
    available: true
  },
  {
    name: "Banana Bread",
    description: "Homemade banana bread with walnuts",
    price: 3.5,
    category: "food",
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Cinnamon Roll",
    description: "Warm cinnamon roll with cream cheese frosting",
    price: 4.0,
    category: "food",
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Quiche",
    description: "Savory egg tart with vegetables and cheese",
    price: 6.0,
    category: "food",
    image: "https://images.unsplash.com/photo-1611171711912-e0f8b0e1e7d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  },
  {
    name: "Fruit Parfait",
    description: "Greek yogurt layered with granola and fresh berries",
    price: 5.5,
    category: "food",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    available: true
  }
];

const seedMenu = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/date_maple');
    
    console.log('Connected to MongoDB');
    
    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Insert new menu items
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Successfully seeded ${createdItems.length} menu items`);
    
    // Display summary
    console.log('\n📋 Menu Items Seeded:');
    createdItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price} (${item.category})`);
    });
    
    console.log(`\n🎉 Total items: ${createdItems.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding menu:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
if (require.main === module) {
  seedMenu();
}