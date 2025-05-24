// src/api/client.ts
import axios from 'axios';

// Create API client
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000/',
  withCredentials: true,           // include httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
});

// Add response interceptor to handle authentication errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors globally
    if (error.response?.status === 401) {
      // Clear local storage on authentication failure
      localStorage.removeItem('userRoles');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Re-throw the error so it can be handled by the calling code
    return Promise.reject(error);
  }
);
