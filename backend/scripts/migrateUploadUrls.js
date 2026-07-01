/**
 * Migration script: convert stored absolute upload URLs to relative paths.
 *
 * Run with: node scripts/migrateUploadUrls.js
 *
 * This updates image fields across MenuItem, EventFlyer, Order, and HomePageContent
 * so they store `/uploads/filename.ext` instead of absolute URLs tied to a
 * specific host/IP.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { getUploadUrl } = require('../utils/uploadUrl');

// Models that may contain uploaded image URLs
const MenuItem = require('../models/MenuItem');
const EventFlyer = require('../models/EventFlyer');
const Order = require('../models/Order');
const HomePageContent = require('../models/HomePageContent');

const MONGODB_URL = process.env.MONGODB_URL_LIVE;

if (!MONGODB_URL) {
  console.error('Error: MONGODB_URL_LIVE is not defined in .env');
  process.exit(1);
}

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');

    let updatedCount = 0;

    // ─── MenuItem.image ───
    const menuItems = await MenuItem.find();
    for (const item of menuItems) {
      if (item.image) {
        const relative = getUploadUrl(item.image);
        if (relative !== item.image) {
          item.image = relative;
          await item.save();
          updatedCount++;
          console.log(`MenuItem ${item._id}: ${item.image}`);
        }
      }
    }

    // ─── EventFlyer.flyerImage ───
    const flyers = await EventFlyer.find();
    for (const flyer of flyers) {
      if (flyer.flyerImage) {
        const relative = getUploadUrl(flyer.flyerImage);
        if (relative !== flyer.flyerImage) {
          flyer.flyerImage = relative;
          await flyer.save();
          updatedCount++;
          console.log(`EventFlyer ${flyer._id}: ${flyer.flyerImage}`);
        }
      }
    }

    // ─── Order.paymentReceipt ───
    const orders = await Order.find();
    for (const order of orders) {
      if (order.paymentReceipt) {
        const relative = getUploadUrl(order.paymentReceipt);
        if (relative !== order.paymentReceipt) {
          order.paymentReceipt = relative;
          await order.save();
          updatedCount++;
          console.log(`Order ${order._id}: ${order.paymentReceipt}`);
        }
      }
    }

    // ─── HomePageContent items/settings images ───
    const homeContents = await HomePageContent.find();
    for (const content of homeContents) {
      let modified = false;

      if (content.image) {
        const relative = getUploadUrl(content.image);
        if (relative !== content.image) {
          content.image = relative;
          modified = true;
        }
      }

      if (Array.isArray(content.items)) {
        for (const item of content.items) {
          if (item && item.image) {
            const relative = getUploadUrl(item.image);
            if (relative !== item.image) {
              item.image = relative;
              modified = true;
            }
          }
        }
      }

      if (content.settings && typeof content.settings === 'object') {
        for (const key of Object.keys(content.settings)) {
          const value = content.settings[key];
          if (typeof value === 'string') {
            const relative = getUploadUrl(value);
            if (relative !== value) {
              content.settings[key] = relative;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        await content.save();
        updatedCount++;
        console.log(`HomePageContent ${content._id} updated`);
      }
    }

    console.log(`\nMigration complete. ${updatedCount} record(s) updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
