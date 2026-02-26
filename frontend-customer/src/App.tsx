import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// React Router v7 future flags
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/ToastContainer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import EventBooking from './pages/EventBooking';
import Events from './pages/Events';
import WaitingPage from './pages/WaitingPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// ThemeDemo removed
import { isAuthenticated, getCurrentUser } from './services/authService';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; clientOnly?: boolean }> = ({ 
  children, 
  adminOnly = false,
  clientOnly = false
}) => {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  if (!authenticated) {
    return <Navigate to="/client-login" replace />;
  }

  // Handle admin-only routes
  if (adminOnly) {
    if (user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Handle client-only routes
  if (clientOnly) {
    // Explicitly allow customer and worker roles
    if (user?.role === 'customer' || user?.role === 'worker') {
      return <>{children}</>;
    }
    
    // Any other role (or missing role) gets redirected to login
    return <Navigate to="/client-login" replace />;
  }

  // Regular protected routes (both admin and client can access)
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router future={routerFuture}>
      <ThemeProvider>
        <ToastProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                
                <Route path="/client-login" element={<ClientLogin />} />
                <Route path="/client-register" element={<ClientRegister />} />
                <Route path="/profile" element={<ProtectedRoute clientOnly={true}><Profile /></ProtectedRoute>} />
                <Route path="/orders" element={<OrderTracking />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                <Route path="/waiting/:orderId" element={<WaitingPage />} />
                <Route path="/events" element={<Events />} />
                <Route path="/event-booking" element={<EventBooking />} />
                <Route path="/catering" element={<EventBooking />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  </Router>
  );
};

export default App;