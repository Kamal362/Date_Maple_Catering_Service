import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="bg-cream shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/admin" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-primary-tea">Date & Maple</span>
          </Link>

          {/* Admin-specific navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/admin" className="text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium relative group flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span className="relative z-10">Overview</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-tea transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/admin/profile" className="text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium relative group flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span className="relative z-10">Admin Profile</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-tea transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/admin/users" className="text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium relative group flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <span className="relative z-10">Users</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-tea transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/admin/events" className="text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium relative group flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="relative z-10">Events</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-tea transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link to="/" className="text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium relative group flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              <span className="relative z-10">Preview Site</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-tea transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/admin/login';
              }}
              className="text-dark-tea hover:text-red-600 transition-colors duration-300 font-medium relative group flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="relative z-10">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-primary-tea"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link to="/admin" className="flex items-center py-2 text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium" onClick={() => setIsOpen(false)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Overview
            </Link>
            <Link to="/admin/profile" className="flex items-center py-2 text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium" onClick={() => setIsOpen(false)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Admin Profile
            </Link>
            <Link to="/admin/users" className="flex items-center py-2 text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium" onClick={() => setIsOpen(false)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              Users
            </Link>
            <Link to="/admin/events" className="flex items-center py-2 text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium" onClick={() => setIsOpen(false)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Events
            </Link>

            <Link to="/" className="flex items-center py-2 text-dark-tea hover:text-primary-tea transition-colors duration-300 font-medium" onClick={() => setIsOpen(false)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Preview Site
            </Link>
            <button 
              onClick={() => {
                setIsOpen(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/admin/login';
              }}
              className="flex items-center py-2 text-dark-tea hover:text-red-600 transition-colors duration-300 font-medium w-full text-left"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;