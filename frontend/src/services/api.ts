import axios from 'axios';
import { AuthResponse, User, Store, Rating, DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Don't add auth header for login and register requests
  const isAuthRoute = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
  
  if (!isAuthRoute) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: { name: string; email: string; password: string; address: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  },
};

export const userAPI = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/users/dashboard');
    return response.data;
  },
  
  getUsers: async (filters?: { search?: string; sortBy?: string; order?: string; role?: string }): Promise<User[]> => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },
  
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData: { name: string; email: string; password: string; address: string; role: string }): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

export const storeAPI = {
  getStores: async (filters?: { search?: string; sortBy?: string; order?: string }): Promise<Store[]> => {
    const response = await api.get('/stores', { params: filters });
    return response.data;
  },
  
  getStoreById: async (id: number): Promise<Store> => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },
  
  createStore: async (storeData: { name: string; email: string; address: string; owner_id?: number }): Promise<Store> => {
    const response = await api.post('/stores', storeData);
    return response.data;
  },
  
  getOwnerDashboard: async () => {
    const response = await api.get('/stores/owner/dashboard');
    return response.data;
  },

  deleteStore: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  },
};

export const ratingAPI = {
  submitRating: async (ratingData: { storeId: number; rating: number }) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },
  
  updateRating: async (ratingData: { storeId: number; rating: number }) => {
    const response = await api.put('/ratings', ratingData);
    return response.data;
  },
  
  deleteRating: async (storeId: number) => {
    const response = await api.delete(`/ratings/${storeId}`);
    return response.data;
  },
  
  getUserRatings: async (userId: number): Promise<Rating[]> => {
    const response = await api.get(`/ratings/user/${userId}`);
    return response.data;
  },
  
  getStoreRatings: async (storeId: number): Promise<Rating[]> => {
    const response = await api.get(`/ratings/store/${storeId}`);
    return response.data;
  },
};

export default api;