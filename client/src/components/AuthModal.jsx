import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showToast } from './Toast';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(loginForm.email, loginForm.password);
    
    if (result.success) {
      showToast('Welcome back! Login successful', 'success');
      onClose();
      setLoginForm({ email: '', password: '' });
    } else {
      showToast(result.error, 'error');
    }
    
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (registerForm.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = registerForm;
    const result = await register(userData);
    
    if (result.success) {
      showToast('Account created successfully! Welcome to ShopHub', 'success');
      onClose();
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
      });
    } else {
      showToast(result.error, 'error');
    }
    
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Login to your account' : 'Join ShopHub today'}</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={switchMode}>Register here</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  required
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone (Optional)</label>
              <input
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="form-group">
              <label>Address (Optional)</label>
              <input
                type="text"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City (Optional)</label>
                <input
                  type="text"
                  value={registerForm.city}
                  onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label>Postal Code (Optional)</label>
                <input
                  type="text"
                  value={registerForm.postalCode}
                  onChange={(e) => setRegisterForm({ ...registerForm, postalCode: e.target.value })}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Country (Optional)</label>
              <input
                type="text"
                value={registerForm.country}
                onChange={(e) => setRegisterForm({ ...registerForm, country: e.target.value })}
                placeholder="United States"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={switchMode}>Login here</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
