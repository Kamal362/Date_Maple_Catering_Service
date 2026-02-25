import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary-tea text-dark-tea hover:bg-accent-tea hover:text-cream transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Simple Moon icon for light mode (switch to dark)
        <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-180" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.21 15.37A9 9 0 1 1 9.21 4.5a7 7 0 0 0 11 10.87z"/>
        </svg>
      ) : (
        // Simple Sun icon for dark mode (switch to light)
        <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-45" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;