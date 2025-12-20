import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import './Account.css';

const Account = () => {
  const { user, loading, isAuthenticated, logout, updateProfile, changePassword, getOrders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
      showToast('Please login to access your account', 'error');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    const userOrders = await getOrders();
    setOrders(userOrders);
    setLoadingOrders(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const result = await updateProfile(profileForm);
    
    if (result.success) {
      showToast('Profile updated successfully', 'success');
      setEditMode(false);
    } else {
      showToast(result.error, 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (result.success) {
      showToast('Password changed successfully', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    showToast('Logged out successfully', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '📦';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="account-loading">
        <div className="loading-spinner"></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <div>
            <h1>My Account</h1>
            <p>Welcome back, {user?.firstName}!</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="account-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
        </div>

        <div className="account-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-header">
                <h2>Personal Information</h2>
                {!editMode && (
                  <button className="edit-btn" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email} disabled />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      disabled={!editMode}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      disabled={!editMode}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      value={profileForm.postalCode}
                      onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setEditMode(false);
                        setProfileForm({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          phone: user?.phone || '',
                          address: user?.address || '',
                          city: user?.city || '',
                          postalCode: user?.postalCode || '',
                          country: user?.country || ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              <h2>Order History</h2>
              {loadingOrders ? (
                <div className="loading-orders">
                  <div className="loading-spinner"></div>
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="no-orders">
                  <p>📦 No orders yet</p>
                  <button className="shop-now-btn" onClick={() => navigate('/products')}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <span className="order-id">Order #{order.id}</span>
                          <span className="order-date">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                          {getStatusIcon(order.status)} {order.status.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="order-details">
                        <p className="order-items">{order.items}</p>
                        <p className="order-total">Total: ${order.total_amount.toFixed(2)}</p>
                      </div>

                      <div className="order-timeline">
                        <div className={`timeline-step ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <span>Pending</span>
                        </div>
                        <div className={`timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <span>Processing</span>
                        </div>
                        <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <span>Shipped</span>
                        </div>
                        <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                          <div className="timeline-dot"></div>
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-tab">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="save-btn">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
