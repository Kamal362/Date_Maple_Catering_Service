# Date & Maple - Deployment Guide

## Project Structure
```
Date_Maple_v5.0/
├── backend/              # Node.js + Express API
├── frontend-admin/       # React Admin Dashboard
└── frontend-customer/    # React Customer Store
```

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- NPM or Yarn

## Environment Setup

### 1. Backend Environment
Copy `backend/.env.example` to `backend/.env` and configure:
```env
NODE_ENV=production
PORT=5002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d

# Stripe (Required for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Production URLs (for CORS)
ADMIN_URL=https://admin.yourdomain.com
CUSTOMER_URL=https://yourdomain.com
```

### 2. Frontend Environment
For both `frontend-admin` and `frontend-customer`:
Copy `.env.example` to `.env` and set:
```env
VITE_API_URL=https://your-api-domain.com
```

## Local Development
```bash
# Start Backend
cd backend
npm install
npm run dev

# Start Admin Frontend (new terminal)
cd frontend-admin
npm install
npm run dev

# Start Customer Frontend (new terminal)
cd frontend-customer
npm install
npm run dev
```

## Production Deployment

### Option 1: Full Build (All-in-One)
```bash
cd backend
npm install
npm run deploy
```
This will:
1. Build frontend-admin
2. Build frontend-customer
3. Start production server

### Option 2: Separate Builds
```bash
# Build frontends
cd frontend-admin && npm install && npm run build
cd frontend-customer && npm install && npm run build

# Start backend
cd backend
npm install
npm run prod
```

### Option 3: Docker Deployment
```bash
# Build images
docker build -t date-maple-backend ./backend
docker build -t date-maple-admin ./frontend-admin
docker build -t date-maple-customer ./frontend-customer

# Run containers
docker-compose up -d
```

## Production URLs
- API: `https://api.yourdomain.com`
- Admin: `https://admin.yourdomain.com`
- Customer: `https://yourdomain.com`

## Post-Deployment Checklist
- [ ] Health check: `GET /api/health`
- [ ] Database connection verified
- [ ] Stripe webhooks configured
- [ ] CORS origins updated
- [ ] SSL certificates installed
- [ ] Environment variables set

## Troubleshooting
- **CORS errors**: Check `ADMIN_URL` and `CUSTOMER_URL` in backend `.env`
- **404 on refresh**: Ensure static file serving is configured
- **API errors**: Verify `VITE_API_URL` in frontend `.env` files
