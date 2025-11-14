import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    set({ token });
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      authStore.getState().setToken(token);
      authStore.getState().setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user } = response.data;
      authStore.getState().setToken(token);
      authStore.getState().setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors 
      };
    }
  },

  logout: () => {
    authStore.getState().setToken(null);
    authStore.getState().setUser(null);
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/auth/me`);
      set({ user: response.data.user, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ user: null, token: null, loading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      set({ user: response.data });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  }
}));

// Initialize auth check on load
if (typeof window !== 'undefined') {
  authStore.getState().checkAuth();
}

export const useAuthStore = authStore;

