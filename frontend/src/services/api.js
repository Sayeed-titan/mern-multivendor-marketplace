import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getTop: () => api.get('/products/top'),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  pay: (id, data) => api.put(`/orders/${id}/pay`, data),
  createPaymentIntent: (data) => api.post('/orders/create-payment-intent', data),
};

// Vendor APIs
export const vendorAPI = {
  getDashboard: () => api.get('/vendor/dashboard'),
  getProducts: (params) => api.get('/vendor/products', { params }),
  createProduct: (data) => api.post('/vendor/products', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  getOrders: () => api.get('/vendor/orders'),
  updateOrderStatus: (id, data) => api.put(`/vendor/orders/${id}`, data),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  getProducts: () => api.get('/admin/products'),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
};

export default api;