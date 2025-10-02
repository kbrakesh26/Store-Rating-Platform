import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    window.location.href = redirectTo;
    return <LoadingSpinner />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="access-denied">
        Access denied. You don't have permission to view this page.
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;