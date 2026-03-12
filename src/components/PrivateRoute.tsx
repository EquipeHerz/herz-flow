import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface PrivateRouteProps {
  roles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Or /unauthorized
  }

  return <Outlet />;
};

export default PrivateRoute;
