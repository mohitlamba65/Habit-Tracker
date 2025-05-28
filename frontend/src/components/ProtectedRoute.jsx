import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Loading:', loading);
  console.log('ProtectedRoute - Location:', location.pathname);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // If no user, redirect to login
  if (!user) {
    console.log('No user, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User is authenticated, render children
  console.log('User authenticated, rendering children');
  return children;
};

export default ProtectedRoute;