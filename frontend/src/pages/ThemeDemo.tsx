import React from 'react';
import ThemeToggle from '../components/ThemeToggle';

const ThemeDemo: React.FC = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading mb-8 text-center">Theme Demo Page</h1>
        
        <div className="mb-8 text-center">
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-2xl font-heading mb-4">Card 1</h2>
            <p className="text-secondary">This is a sample card demonstrating the theme colors and styling.</p>
            <button className="btn-primary mt-4">Primary Button</button>
          </div>
          
          <div className="card p-6">
            <h2 className="text-2xl font-heading mb-4">Card 2</h2>
            <p className="text-secondary">Cards adapt to the current theme with appropriate background and text colors.</p>
            <button className="btn-secondary mt-4">Secondary Button</button>
          </div>
          
          <div className="card p-6">
            <h2 className="text-2xl font-heading mb-4">Card 3</h2>
            <p className="text-secondary">The theme toggle persists your preference across sessions.</p>
            <div className="mt-4 p-3 bg-secondary-tea rounded text-dark-tea">
              Sample colored box
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-3xl font-heading mb-6">Theme Features</h2>
          <ul className="space-y-3 text-secondary">
            <li className="flex items-start">
              <span className="text-primary-tea mr-2">•</span>
              Three theme modes: Default (tea colors), Light, and Dark
            </li>
            <li className="flex items-start">
              <span className="text-primary-tea mr-2">•</span>
              Automatic persistence using localStorage
            </li>
            <li className="flex items-start">
              <span className="text-primary-tea mr-2">•</span>
              Smooth transitions between themes
            </li>
            <li className="flex items-start">
              <span className="text-primary-tea mr-2">•</span>
              Responsive design that works on all devices
            </li>
            <li className="flex items-start">
              <span className="text-primary-tea mr-2">•</span>
              System preference detection for initial theme
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center text-secondary">
          <p>Try switching between themes using the toggle above to see the different color schemes!</p>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;