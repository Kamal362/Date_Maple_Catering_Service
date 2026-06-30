import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  clientOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  clientOnly = false
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  useEffect(() => {
    // Brief verification delay to prevent flash and ensure auth state is stable
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Verifying access..." />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (clientOnly && user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
