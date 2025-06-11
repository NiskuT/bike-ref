import { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  isNetworkError: boolean
  isConnectionError?: boolean
}

interface ServerErrorResponse {
  code?: number
  message?: string
}

export const getErrorMessage = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    // Network error (host unreachable, timeout, etc.)
    if (!error.response) {
      const isConnectionError = error.code === 'NETWORK_ERROR' || 
                               error.code === 'ECONNABORTED' ||
                               error.message.includes('timeout') ||
                               error.message.includes('Network Error')
      
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        isNetworkError: true,
        isConnectionError,
      }
    }

    const status = error.response.status
    
    // Check if server provided a custom error message
    const serverError = error.response.data as ServerErrorResponse
    if (serverError && typeof serverError.message === 'string' && serverError.message.trim()) {
      return {
        message: serverError.message,
        status,
        isNetworkError: false,
        isConnectionError: false,
      }
    }

    // Fall back to default messages based on status code
    switch (status) {
      case 401:
        return {
          message: 'Session expired or invalid credentials. Please login again.',
          status: 401,
          isNetworkError: false,
          isConnectionError: false,
        }
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          status: 403,
          isNetworkError: false,
          isConnectionError: false,
        }
      case 404:
        return {
          message: 'The requested resource was not found.',
          status: 404,
          isNetworkError: false,
          isConnectionError: false,
        }
      case 500:
        return {
          message: 'Internal server error. Please try again later or contact support.',
          status: 500,
          isNetworkError: false,
          isConnectionError: false,
        }
      case 502:
      case 503:
      case 504:
        return {
          message: 'The server is temporarily unavailable. Please try again later.',
          status,
          isNetworkError: false,
          isConnectionError: true, // These could be connection-related
        }
      default:
        return {
          message: `An unexpected error occurred (${status}). Please try again.`,
          status,
          isNetworkError: false,
          isConnectionError: false,
        }
    }
  }

  // Non-Axios error
  return {
    message: 'An unexpected error occurred. Please try again.',
    isNetworkError: false,
    isConnectionError: false,
  }
}

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError && error.response) {
    return error.response.status === 401 || error.response.status === 403
  }
  return false
}

export const isAuthErrorFromMessage = (errorMessage: string): boolean => {
  return errorMessage.includes('Session expired') || 
         errorMessage.includes('invalid credentials') || 
         errorMessage.includes('Please login again') ||
         errorMessage.includes('401')
}

export const redirectToLogin = (): void => {
  // Clear any existing auth data
  localStorage.removeItem('userRoles')
  
  // Force redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export const isConnectionError = (error: unknown): boolean => {
  const apiError = getErrorMessage(error)
  return apiError.isNetworkError || apiError.isConnectionError || false
} 
