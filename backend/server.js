const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import database configuration
const connectDB = require('./config/db');

// Import Passport configuration
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const passportAuthRoutes = require('./routes/passportAuth');
const clientAuthRoutes = require('./routes/clientAuth');
const workerAuthRoutes = require('./routes/workerAuth');
const socialAuthRoutes = require('./routes/socialAuth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const eventRoutes = require('./routes/events');
const eventFlyerRoutes = require('./routes/eventFlyers');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const paymentMethodRoutes = require('./routes/paymentMethods');
const homeContentRoutes = require('./routes/homeContent');
const reviewsRoutes = require('./routes/reviews');
const couponsRoutes = require('./routes/coupons');
const uploadRoutes = require('./routes/upload');
const contactRoutes = require('./routes/contact');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

const isProduction = process.env.NODE_ENV === 'production';

// ─── Allowed origins ──────────────────────────────────────────────────────────
const allowedOrigins = isProduction
  ? [process.env.ADMIN_URL, process.env.CUSTOMER_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'];

// ─── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const server = createServer(app);
const io = new Server(server, {
  cors: {
    // FIX: allow ALL known origins for socket connections, not just one
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    const publicEndpoints = ['/api/menu', '/api/auth/login', '/api/auth/register', '/api/health', '/api/events/flyers'];
    return publicEndpoints.some(endpoint => req.path.startsWith(endpoint));
  }
});
app.use('/api/', limiter);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// FIX: Single unified CORS setup — removed the duplicate manual header middleware
// which conflicted with the cors() package and caused mismatches in production.
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// ─── General middleware ───────────────────────────────────────────────────────
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// FIX: Use absolute path for uploads static serving
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/auth', passportAuthRoutes);
app.use('/api/client/auth', clientAuthRoutes);
app.use('/api/worker/auth', workerAuthRoutes);
app.use('/api/auth', socialAuthRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/events/flyers', eventFlyerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/home-content', homeContentRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Date&Maple API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ─── Production static file serving ──────────────────────────────────────────
if (isProduction) {
  // ── ADMIN APP ──
  // FIX: Admin assets served under /admin/assets to avoid colliding with
  // the customer app's /assets path. Your Vite admin build MUST set:
  //   base: '/admin/'   in vite.config.ts
  app.use('/admin/assets', express.static(path.join(__dirname, '../frontend-admin/dist/assets')));
  app.use('/admin/favicon.ico', express.static(path.join(__dirname, '../frontend-admin/dist/favicon.ico')));
  // Serve other static files under /admin (e.g. fonts, images placed in /public)
  app.use('/admin', express.static(path.join(__dirname, '../frontend-admin/dist'), { index: false }));

  // ── CUSTOMER APP ──
  app.use('/assets', express.static(path.join(__dirname, '../frontend-customer/dist/assets')));
  app.use(express.static(path.join(__dirname, '../frontend-customer/dist'), { index: false }));

  // ── SPA Fallbacks ──
  // FIX: Admin fallback MUST come before the customer catch-all '*'
  // Use a regex so that /admin and /admin/anything both resolve correctly
  app.get(/^\/admin(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend-admin/dist/index.html'));
  });

  // Customer SPA catch-all — must be last
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend-customer/dist/index.html'));
  });
}

// ─── Error handling ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: isProduction ? {} : err.message
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
// Note: in production this is only reached for non-API, non-static paths
// because the SPA catch-alls above handle everything else.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('orderStatusUpdate', (data) => {
    const userSocketId = connectedUsers.get(data.userId);
    if (userSocketId) {
      io.to(userSocketId).emit('orderStatusUpdated', data);
    }
  });

  socket.on('adminNotification', (data) => {
    socket.broadcast.emit('newAdminNotification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

module.exports = { app, server, io };
