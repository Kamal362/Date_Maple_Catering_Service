import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      console.log('Login response:', response);
      console.log('Token after login:', localStorage.getItem('token'));
      
      if (response.success) {
        // Check user role and redirect accordingly
        if (response.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-tea">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-tea">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-tea hover:text-accent-tea">
            contact administrator for account access
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-secondary-tea">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-tea">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-secondary-tea rounded-md shadow-sm placeholder-secondary-tea focus:outline-none focus:ring-primary-tea focus:border-primary-tea sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-tea">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-secondary-tea rounded-md shadow-sm placeholder-secondary-tea focus:outline-none focus:ring-primary-tea focus:border-primary-tea sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-tea focus:ring-primary-tea border-secondary-tea rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-tea">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-tea hover:text-accent-tea">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-cream ${
                  loading
                    ? 'bg-primary-tea opacity-75 cursor-not-allowed'
                    : 'bg-primary-tea hover:bg-accent-tea focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-tea'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-tea" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-tea">Test Credentials</span>
              </div>
            </div>

            <div className="mt-4 bg-light-tea border border-secondary-tea rounded-md p-4">
              <p className="text-sm font-medium text-dark-tea mb-2">Admin Account:</p>
              <p className="text-xs text-secondary-tea">Email: admin@datemaple.com</p>
              <p className="text-xs text-secondary-tea">Password: admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;