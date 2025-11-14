import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const schemeAPI = {
  getAll: (params) => api.get('/schemes', { params }),
  getById: (id) => api.get(`/schemes/${id}`),
  getCategories: () => api.get('/schemes/categories/list'),
};

export const eligibilityAPI = {
  check: (schemeId, userData) => api.post('/eligibility/check', { schemeId, userData }),
  checkMultiple: (userData, params) => api.post('/eligibility/check-multiple', { userData }, { params }),
  getHistory: () => api.get('/eligibility/history'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
};

export default api;

