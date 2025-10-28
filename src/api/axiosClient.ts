import axios from 'axios';

// Use environment variable or fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://expense-tracker-api-yhj7.onrender.com';

// Create axios instance with default config
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
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

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
git     // Only redirect on 401 if NOT on login/register endpoints
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expired or invalid - clear storage and redirect to login
      console.log('Session expired, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Use React Router navigation instead of window.location
      // to avoid full page refresh
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;

