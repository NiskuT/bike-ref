// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Create API client
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9000/',
  withCredentials: true,           // include httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,                  // 30 second timeout (increased for mobile)
});

// Retry configuration
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // 1 second

// Track consecutive 401 errors to avoid infinite loops
let consecutive401Errors = 0;
const MAX_401_ERRORS_BEFORE_LOGOUT = 3;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  // Network errors (no response)
  if (!error.response) {
    return true;
  }
  
  // Server errors that might be temporary
  const status = error.response.status;
  return status >= 500 || status === 408 || status === 429;
};

// Add request interceptor to add retry logic
client.interceptors.request.use(
  (config) => {
    // Add retry count to config if not already present
    if (!config.metadata) {
      config.metadata = { retryCount: 0 };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors and retries
client.interceptors.response.use(
  (response) => {
    // Reset 401 error counter on successful response
    consecutive401Errors = 0;
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { metadata?: { retryCount: number } };
    
    // Handle retryable errors (network issues, server errors)
    if (isRetryableError(error) && originalRequest && originalRequest.metadata) {
      const retryCount = originalRequest.metadata.retryCount || 0;
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        originalRequest.metadata.retryCount = retryCount + 1;
        
        console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}):`, originalRequest.url);
        
        // Wait before retrying, with exponential backoff
        await delay(RETRY_DELAY * Math.pow(2, retryCount));
        
        // Retry the request
        return client(originalRequest);
      }
    }
    
    // Handle authentication errors more intelligently
    if (error.response?.status === 401) {
      consecutive401Errors++;
      
      console.log(`401 error count: ${consecutive401Errors}/${MAX_401_ERRORS_BEFORE_LOGOUT}`);
      
      // Only redirect to login after multiple consecutive 401 errors
      // This prevents redirecting on temporary network issues or browser suspension
      if (consecutive401Errors >= MAX_401_ERRORS_BEFORE_LOGOUT) {
        console.log('Multiple 401 errors detected, clearing auth and redirecting to login');
        
        // Clear local storage on authentication failure
        localStorage.removeItem('userRoles');
        
        // Reset the counter
        consecutive401Errors = 0;
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else {
      // Reset 401 counter on non-401 errors
      consecutive401Errors = 0;
    }
    
    // Re-throw the error so it can be handled by the calling code
    return Promise.reject(error);
  }
);

// Extend AxiosRequestConfig to include our custom metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      retryCount: number;
    };
  }
}
