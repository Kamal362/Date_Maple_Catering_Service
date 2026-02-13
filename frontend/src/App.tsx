import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/ToastContainer';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminEvents from "./pages/AdminEvents";
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import EventBooking from './pages/EventBooking';
import WaitingPage from './pages/WaitingPage';
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

  // Enhanced logging for debugging
  console.log('=== ProtectedRoute Debug Info ===');
  console.log('Path:', window.location.pathname);
  console.log('Authenticated:', authenticated);
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('AdminOnly flag:', adminOnly);
  console.log('ClientOnly flag:', clientOnly);
  console.log('Token exists:', !!localStorage.getItem('token'));
  console.log('================================');

  // Additional validation: Check if user data is valid
  const isValidUser = user && user.role && typeof user.role === 'string';
  
  // Handle completely unauthenticated users
  if (!authenticated) {
    console.log('User not authenticated, redirecting to login');
    const redirectPath = adminOnly ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} replace />;
  }
  
  // Handle invalid user data - but be more permissive for client routes
  if (!isValidUser) {
    console.log('Invalid user data detected');
    if (clientOnly) {
      // For client routes, clear auth and redirect to regular login
      console.log('Clearing auth data and redirecting client to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    } else if (adminOnly) {
      // For admin routes, redirect to admin login
      console.log('Redirecting to admin login');
      return <Navigate to="/admin/login" replace />;
    } else {
      // For general routes, clear auth and redirect to regular login
      console.log('Clearing auth data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  // Handle admin-only routes
  if (adminOnly) {
    if (user.role !== 'admin') {
      console.log('Non-admin user trying to access admin route, redirecting to home');
      return <Navigate to="/" replace />;
    }
    console.log('Admin access granted for user:', user.email);
    return <>{children}</>;
  }

  // Handle client-only routes
  if (clientOnly) {
    // Explicitly allow customer and worker roles
    if (user.role === 'customer' || user.role === 'worker') {
      console.log('Client access GRANTED for user:', user.email, 'Role:', user.role);
      return <>{children}</>;
    }
    
    // Admins get redirected to admin dashboard
    if (user.role === 'admin') {
      console.log('ADMIN DETECTED trying to access client route - redirecting to admin dashboard');
      return <Navigate to="/admin" replace />;
    }
    
    // Any other role (or missing role) gets redirected to login
    console.log('Invalid or unknown role for client route:', user.role, '- redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Regular protected routes (both admin and client can access)
  console.log('General access granted for user:', user.email, 'Role:', user.role);
  return <>{children}</>;
};

const App: React.FC = () => {
  console.log('=== MAIN APP COMPONENT RENDERING ===');
  console.log('App component rendering');
  console.log('Current token:', localStorage.getItem('token'));
  console.log('Current user:', getCurrentUser());

  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {window.location.pathname.startsWith('/admin') ? <AdminNavbar /> : <Navbar />}
              <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRoute adminOnly>
                    <AdminProfile />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <AdminUserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <ProtectedRoute adminOnly>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/client-login" element={<ClientLogin />} />
                <Route path="/client-register" element={<ClientRegister />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<OrderTracking />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                <Route path="/waiting/:orderId" element={<WaitingPage />} />
                <Route path="/events" element={<EventBooking />} />
                <Route path="/catering" element={<EventBooking />} />
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