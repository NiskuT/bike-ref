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
    
    // Special handling for login endpoint (PUT /login)
    if (error.config?.method === 'put' && error.config?.url?.includes('/login')) {
      // Mock successful login response with roles
      return Promise.resolve({ 
        data: { 
          roles: ['admin:*', 'create:competition', 'referee:1', 'referee:2'] // Mock admin roles
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }
    
    // Special handling for competition creation (POST /competition)
    if (error.config?.method === 'post' && error.config?.url?.includes('/competition')) {
      if (error.config?.url?.includes('/zone')) {
        // Mock zone creation response
        return Promise.resolve({ 
          data: { success: true, message: 'Zone created successfully' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      } else {
        // Mock competition creation response
        return Promise.resolve({ 
          data: { 
            id: Math.floor(Math.random() * 1000),
            name: 'Mock Competition',
            date: '2024-01-01',
            location: 'Mock Location',
            description: 'Mock Description',
            organizer: 'Mock Organizer',
            contact: 'mock@email.com'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
    }
    
    // Mock competition list response (GET /competition)
    if (error.config?.method === 'get' && error.config?.url?.includes('/competition')) {
      return Promise.resolve({ 
        data: { 
          competitions: [
            {
              id: 1,
              name: 'Mock Competition 1',
              date: '2024-01-01',
              location: 'Mock Location 1',
              description: 'Mock Description 1',
              organizer: 'Mock Organizer 1',
              contact: 'mock1@email.com'
            },
            {
              id: 2,
              name: 'Mock Competition 2',
              date: '2024-01-02',
              location: 'Mock Location 2',
              description: 'Mock Description 2',
              organizer: 'Mock Organizer 2',
              contact: 'mock2@email.com'
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }
    
    // Default mock response for other endpoints
    return Promise.resolve({ 
      data: { success: true, message: 'Mock API Response' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: error.config,
    });
  }
);
