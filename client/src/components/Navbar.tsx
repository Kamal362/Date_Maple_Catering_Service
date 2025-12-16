
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="bg-cream shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-primary-tea">Date & Maple</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/menu" className="nav-link">Menu</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/catering" className="nav-link">Catering</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6 text-primary-tea hover:text-accent-tea transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-tea text-cream text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
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
            <Link to="/" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/menu" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Menu</Link>
            <Link to="/about" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/catering" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Catering</Link>
            <Link to="/contact" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>Contact</Link>
            <Link to="/cart" className="block py-2 nav-link" onClick={() => setIsOpen(false)}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
