// src/api/client.ts
import axios from 'axios';

// Create a mock API client that doesn't depend on environment variables
export const client = axios.create({
  baseURL: 'http://localhost:9000/', // Mock API URL
  withCredentials: true,           // include httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
});

// Add a mock interceptor that simulates successful API responses
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error (mock):', error);
    // Create a mock successful response
    return Promise.resolve({ 
      data: { success: true, message: 'Mock API Response' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
  }
);
