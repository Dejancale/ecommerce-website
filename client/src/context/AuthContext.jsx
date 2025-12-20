import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      await axios.put('http://localhost:3000/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser({ ...user, ...profileData });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Update failed'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post(
        'http://localhost:3000/api/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed'
      };
    }
  };

  const getOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  const getOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/auth/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin === 1,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    getOrders,
    getOrderDetails
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
