import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('createcode_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors & unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (!window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') {
        localStorage.removeItem('createcode_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

