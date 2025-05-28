import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/axios.js'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Login component - User:', user);
  console.log('Login component - Loading:', loading);
  console.log('Login component - Location state:', location.state);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('User already logged in, redirecting');
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    try {
      const res = await API.post("users/login", form);
      console.log('Login API response:', res.data);
      
      toast.success("Login successful")
      login(res.data.user); 
      
      // Redirect to the page they were trying to access, or dashboard
      const from = location.state?.from || '/dashboard';
      console.log('Redirecting to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Don't render if user is already logged in
  if (user && !loading) {
    console.log('User logged in, not rendering login form');
    return null;
  }

  // Don't render while loading
  if (loading) {
    console.log('Still loading, not rendering login form');
    return null;
  }

  console.log('Rendering login form');

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-200 to-gray-400">
      <motion.form
        className="bg-white p-10 shadow-xl rounded-lg max-w-md w-full"
        onSubmit={handleSubmit}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
          required
        />
        
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Login
        </button>

        {/* Social Login Options */}
        <div className="flex justify-around mt-6">
          <button type="button" className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200">
            <FcGoogle size={20} /> <span>Google</span>
          </button>
          <button type="button" className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200">
            <FaGithub size={20} /> <span>GitHub</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Login;