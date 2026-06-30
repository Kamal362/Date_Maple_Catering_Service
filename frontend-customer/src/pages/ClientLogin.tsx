import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const ClientLogin: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        setShowSuccessModal(true);
      } else {
        showError('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    // Create guest session and navigate to menu
    success('Starting guest checkout...');
    navigate('/menu');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/profile');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-cream'} flex items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in-up`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-tea rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h1 className={`text-3xl font-heading font-bold ${isDark ? 'text-amber-400' : 'text-primary-tea'} mb-2`}>
            Welcome Back
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Sign in to your account or continue as guest
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-tea focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-500' : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-tea focus:border-transparent transition-all duration-200 ${
                errors.password ? 'border-red-500' : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-tea text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>Or</span>
            </div>
          </div>

          <button
            onClick={handleGuestCheckout}
            className="w-full mt-4 bg-primary-tea text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition"
          >
            Continue as Guest
          </button>
        </div>

        <div className={`mt-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>
            Don't have an account?{' '}
            <Link 
              to="/client-register" 
              className={`${isDark ? 'text-amber-400' : 'text-primary-tea'} font-medium hover:underline`}
            >
              Sign up
            </Link>
          </p>
          
          <p className="mt-2 text-sm">
            <Link to="/forgot-password" className="hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in`}>
            <div className="w-16 h-16 bg-secondary-tea/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-tea" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className={`text-2xl font-heading font-bold ${isDark ? 'text-amber-400' : 'text-primary-tea'} mb-2`}>
              Login Successful!
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              You have successfully logged in. Welcome back to Date & Maple!
            </p>
            <button
              onClick={handleSuccessModalClose}
              className="w-full bg-primary-tea text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition"
            >
              Go to My Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLogin;