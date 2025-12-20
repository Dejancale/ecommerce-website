import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/account');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      showToast('Welcome back! Login successful', 'success');
      navigate('/');
    } else {
      showToast(result.error, 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to your ShopHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot your password?
            </Link>
            <p>
              Don't have an account?{' '}
              <Link to="/signup">Sign up here</Link>
            </p>
            <Link to="/" className="back-home">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
