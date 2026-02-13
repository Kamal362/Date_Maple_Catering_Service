const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const cleanupMenuItems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/date_maple');
    console.log('Connected to MongoDB');
    
    // Get all menu items
    const items = await MenuItem.find({});
    console.log(`\n📋 Found ${items.length} menu items:`);
    
    // Identify items without proper images
    const itemsWithoutImages = items.filter(item => 
      !item.image || 
      item.image === '' || 
      !item.image.startsWith('http')
    );
    
    console.log(`\n⚠️  Items without proper images (${itemsWithoutImages.length}):`);
    itemsWithoutImages.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.category} - Image: ${item.image || 'MISSING'}`);
    });
    
    if (itemsWithoutImages.length > 0) {
      console.log(`\n🗑️  Deleting ${itemsWithoutImages.length} items without proper images...`);
      
      // Delete items without images
      const deleteResult = await MenuItem.deleteMany({
        _id: { $in: itemsWithoutImages.map(item => item._id) }
      });
      
      console.log(`✅ Successfully deleted ${deleteResult.deletedCount} items`);
      
      // Show remaining items
      const remainingItems = await MenuItem.find({});
      console.log(`\n✅ Remaining ${remainingItems.length} items:`);
      remainingItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - ${item.category} ✓`);
      });
    } else {
      console.log('\n✅ All menu items have proper images!');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning menu items:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the cleanup
cleanupMenuItems();