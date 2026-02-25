import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// React Router v7 future flags
const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/ToastContainer';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminEvents from './pages/AdminEvents';
import AdminMenuManagement from './pages/AdminMenuManagement';
import AdminPaymentMethods from './pages/AdminPaymentMethods';
import AdminPaymentProofs from './pages/AdminPaymentProofs';
import AdminHomeContent from './pages/AdminHomeContent';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router future={routerFuture}>
        <div className="min-h-screen flex flex-col bg-cream dark:bg-gray-900 transition-colors duration-300">
          <AdminNavbar />
          <main className="flex-grow pt-16 bg-cream dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute adminOnly><AdminProfile /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute adminOnly><AdminUserManagement /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
              <Route path="/menu" element={<ProtectedRoute adminOnly><AdminMenuManagement /></ProtectedRoute>} />
              <Route path="/payment-methods" element={<ProtectedRoute adminOnly><AdminPaymentMethods /></ProtectedRoute>} />
              <Route path="/payment-proofs" element={<ProtectedRoute adminOnly><AdminPaymentProofs /></ProtectedRoute>} />
              <Route path="/home-content" element={<ProtectedRoute adminOnly><AdminHomeContent /></ProtectedRoute>} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;