import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/axios';
import { Loader } from 'lucide-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logs
  console.log('AuthProvider render - Current path:', location.pathname);
  console.log('AuthProvider render - User:', user);
  console.log('AuthProvider render - Loading:', loading);
  console.log('AuthProvider render - Initialized:', initialized);

  const checkAuth = useCallback(async () => {
    // Prevent multiple auth checks
    if (initialized) return;

    console.log('Checking auth for:', location.pathname);
    
    // Skip auth check on public pages
    const publicPaths = ['/', '/login', '/signup'];
    if (publicPaths.includes(location.pathname)) {
      console.log('Public path detected, skipping auth check');
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      console.log('Making API call to /users/me');
      const res = await API.get('users/me'); 
      console.log('Auth check successful:', res.data.user);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.warn("User not authenticated:", err.response?.status);
      setUser(null);
      localStorage.removeItem("user");
      
      // Only redirect if on protected route
      if (!publicPaths.includes(location.pathname)) {
        console.log('Redirecting to login from:', location.pathname);
        navigate('/login', { 
          replace: true, 
          state: { from: location.pathname } 
        });
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [location.pathname, navigate, initialized]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((userData) => {
    console.log('Login called with:', userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    console.log('Logout called');
    try {
      await API.get('/logout');
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
    setInitialized(false); // Reset initialization state
    navigate('/login', { replace: true });
  }, [navigate]);

  if (loading) {
    console.log('Showing loader');
    return <Loader/>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};