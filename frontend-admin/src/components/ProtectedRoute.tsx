import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../services/authService';

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
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  console.log('=== ProtectedRoute Debug Info ===');
  console.log('Authenticated:', authenticated);
  console.log('User:', user);
  console.log('AdminOnly flag:', adminOnly);
  console.log('ClientOnly flag:', clientOnly);

  if (!authenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/admin-login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    console.log('User is not an admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (clientOnly && user?.role === 'admin') {
    console.log('Admin user accessing client route, redirecting to admin home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};