import axios from 'axios';

const api = axios.create({
  baseURL: 'https://caresync-gdevh3eccggqhjch.southafricanorth-01.azurewebsites.net/api',
  timeout: 10000,
});

// Request interceptor to add auth token (for all roles)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors (for all roles)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default api;
