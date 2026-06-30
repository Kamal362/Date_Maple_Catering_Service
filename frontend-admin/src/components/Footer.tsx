import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-tea dark:bg-gray-900 text-cream py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-heading font-bold text-cream mb-3">
              Date & Maple
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Admin dashboard for managing your coffee shop experience, menu, orders, events, and customer engagement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cream mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-accent-tea transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-sm text-gray-300 hover:text-accent-tea transition-colors duration-200">
                  Menu Management
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-sm text-gray-300 hover:text-accent-tea transition-colors duration-200">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-300 hover:text-accent-tea transition-colors duration-200">
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-cream mb-3">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/inquiries" className="text-sm text-gray-300 hover:text-accent-tea transition-colors duration-200">
                  Customer Messages
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-sm text-gray-300 hover:text-accent-tea transition-colors duration-200">
                  Reviews
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-300">
                  admin@dateandmaple.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-600 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-300 text-center sm:text-left">
              &copy; {currentYear} Date & Maple. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Admin Panel v5.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;