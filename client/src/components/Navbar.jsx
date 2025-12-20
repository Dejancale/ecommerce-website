import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.account-dropdown')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAccountMenu]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (path) => {
    scrollToTop();
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo" onClick={scrollToTop}>ShopHub</Link>
        
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={() => handleNavClick('/')}>Home</Link></li>
          <li><Link to="/products" className={isActive('/products')} onClick={() => handleNavClick('/products')}>Products</Link></li>
          <li><a href="#about" onClick={handleAboutClick}>About</a></li>
          <li><a href="#contact" onClick={handleContactClick}>Contact Us</a></li>
          
          {isAdmin && (
            <li>
              <Link to="/admin" className={`admin-link ${isActive('/admin')}`} onClick={() => handleNavClick('/admin')}>
                ⚙️ Admin
              </Link>
            </li>
          )}
          
          {isAuthenticated ? (
            <li className="account-dropdown">
              <button 
                className="account-btn"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                👤 {user?.firstName}
              </button>
              {showAccountMenu && (
                <div className="account-menu">
                  <Link 
                    to="/account" 
                    onClick={() => {
                      setShowAccountMenu(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    My Account
                  </Link>
                  <Link 
                    to="/my-orders" 
                    onClick={() => {
                      setShowAccountMenu(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    📦 My Orders
                  </Link>
                  <button 
                    className="logout-btn-menu"
                    onClick={() => {
                      logout();
                      setShowAccountMenu(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li className="auth-buttons">
              <Link to="/login" className="login-btn" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="signup-btn" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </li>
          )}

          <li>
            <Link to="/cart" className="cart-icon" onClick={() => setIsMenuOpen(false)}>
              🛒 {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </li>
        </ul>

        <div 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
