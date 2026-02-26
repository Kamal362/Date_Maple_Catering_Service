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

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store connected users
const connectedUsers = new Map();

// Rate limiting for protected routes only
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for public endpoints
    const publicEndpoints = ['/api/menu', '/api/auth/login', '/api/auth/register', '/api/health', '/api/events/flyers'];
    return publicEndpoints.some(endpoint => req.path.startsWith(endpoint));
  }
});
app.use('/api/', limiter);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with CORS support

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.ADMIN_URL, process.env.CUSTOMER_URL].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
})); // Enable CORS with specific origins
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static('uploads'));

// Passport middleware
app.use(passport.initialize());

// Routes
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Date&Maple API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  // Serve admin build
  app.use('/admin', express.static('../frontend-admin/dist'));
  
  // Serve customer build
  app.use('/', express.static('../frontend-customer/dist'));
  
  // Handle client-side routing for admin - match any path starting with /admin/
  app.get(/^\/admin(\/.*)?$/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend-admin/dist/index.html'));
  });
  
  // Handle client-side routing for customer
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend-customer/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user joining
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });
  
  // Handle order status updates
  socket.on('orderStatusUpdate', (data) => {
    // Emit to specific user if connected
    const userSocketId = connectedUsers.get(data.userId);
    if (userSocketId) {
      io.to(userSocketId).emit('orderStatusUpdated', data);
    }
  });
  
  // Handle admin notifications
  socket.on('adminNotification', (data) => {
    // Emit to all connected admins
    socket.broadcast.emit('newAdminNotification', data);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

module.exports = { app, server, io };