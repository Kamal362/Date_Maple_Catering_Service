# Date&Maple - Catering Service Application

## Project Summary

We have successfully built a comprehensive full-stack web application for Date&Maple catering service with the following features:

## Backend (Server-Side)

### Technology Stack
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO for live updates
- **Email**: Nodemailer for notifications
- **Security**: Helmet, CORS, Morgan, Rate Limiting

### Implemented Features

1. **User Authentication & Authorization**
   - JWT-based authentication system
   - Role-based access control (customer, admin, manager, chef, cashier)
   - Password encryption with bcrypt
   - Protected routes middleware

2. **Database Models**
   - User model with role management
   - MenuItem model for food/drink items
   - Order model for customer orders
   - Event model for catering bookings
   - Coupon model for discounts
   - Review model for customer feedback
   - Inventory model for ingredient tracking
   - Cart model for shopping cart functionality

3. **API Endpoints**

   **Auth Routes** (`/api/auth`)
   - POST `/register` - User registration
   - POST `/login` - User login
   - GET `/me` - Get current user info

   **Menu Routes** (`/api/menu`)
   - GET `/` - Get all menu items
   - GET `/:id` - Get single menu item
   - POST `/` - Create new menu item (Admin only)
   - PUT `/:id` - Update menu item (Admin only)
   - DELETE `/:id` - Delete menu item (Admin only)

   **Cart Routes** (`/api/cart`)
   - GET `/` - Get user's cart
   - POST `/` - Add item to cart
   - PUT `/:itemId` - Update cart item quantity
   - DELETE `/:itemId` - Remove item from cart
   - DELETE `/` - Clear entire cart

   **Checkout Routes** (`/api/checkout`)
   - POST `/` - Process checkout and create order

   **Order Routes** (`/api/orders`)
   - GET `/` - Get all orders (Admin only)
   - GET `/myorders` - Get orders for current user
   - GET `/:id` - Get single order
   - PUT `/:id/status` - Update order status (Admin only)
   - PUT `/:id/payment` - Update payment status (Admin only)
   - DELETE `/:id` - Delete order (Admin only)

   **Event Routes** (`/api/events`)
   - GET `/` - Get all events (Admin only)
   - GET `/myevents` - Get events for current user
   - GET `/:id` - Get single event
   - POST `/` - Create new event booking
   - PUT `/:id` - Update event
   - PUT `/:id/status` - Update event status (Admin only)
   - DELETE `/:id` - Delete event

   **Admin Routes** (`/api/admin`)
   - GET `/stats` - Get dashboard statistics
   - GET `/users` - Get all users
   - GET `/users/:id` - Get single user
   - PUT `/users/:id` - Update user
   - DELETE `/users/:id` - Delete user
   - GET `/inventory/low` - Get low inventory items

   **Notification Routes** (`/api/notifications`)
   - POST `/order-confirmation` - Send order confirmation email
   - POST `/order-status` - Send order status update email
   - POST `/general` - Send general notification email

4. **Real-time Features**
   - Socket.IO integration for live updates
   - Order status tracking
   - Admin notifications

5. **Security Features**
   - Rate limiting to prevent abuse
   - Input validation middleware
   - Password strength requirements
   - Secure HTTP headers with Helmet
   - CORS configuration

## Frontend (Client-Side)

### Technology Stack
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Build Tool**: Vite

### Implemented Pages
- Homepage with hero section and featured dishes
- Menu page with event booking form
- Shopping cart system
- Checkout process with delivery/pickup options
- User authentication (login/register)
- User profile management
- Order tracking system
- Admin dashboard

## How to Run the Application

### Backend Setup
1. Navigate to the `backend` directory
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the `client` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Environment Variables

The application requires the following environment variables in the backend `.env` file:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRE` - JWT expiration time
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `FROM_EMAIL` - Sender email address

## Future Enhancements
1. Mobile app development
2. SMS notifications
3. Push notifications
4. Advanced analytics dashboard
5. Loyalty rewards program
6. Multi-vendor marketplace expansion
7. PWA support for offline browsing
8. Stripe payment integration

This application provides a solid foundation for a catering service business with all the essential features needed to manage customers, orders, events, and inventory.