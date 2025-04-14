import { useState } from 'react';
import { motion } from 'framer-motion';
import API from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const res = await API.post('/users/register', form);
      toast.success('Signup successful');
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  // Placeholder: Redirect to your backend OAuth endpoint
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleGithubSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-300 to-blue-400">
      <motion.form
        className="bg-white p-10 shadow-xl rounded-lg max-w-md w-full"
        onSubmit={handleSubmit}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Sign Up
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
        />

        <button
          type="submit"
          className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
        >
          Sign Up
        </button>

        {/* Social Signup Options */}
        <div className="flex justify-around mt-6">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200"
          >
            <FcGoogle size={20} /> <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleGithubSignup}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200"
          >
            <FaGithub size={20} /> <span>GitHub</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Signup;
