import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useCallback } from 'react';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const redirectToDashboard = useCallback(() => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
    return children;
  }, [isAuthenticated, location, children]);

  return redirectToDashboard();
};

export default PublicRoute; 