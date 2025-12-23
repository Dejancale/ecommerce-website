import axios from 'axios';
import API_BASE_URL from '../config.js';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const getProductReviews = (id) => api.get(`/products/${id}/reviews`);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);

export default api;
