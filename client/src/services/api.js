import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
