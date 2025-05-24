import { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  isNetworkError: boolean
}

export const getErrorMessage = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    // Network error (host unreachable, timeout, etc.)
    if (!error.response) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        isNetworkError: true,
      }
    }

    const status = error.response.status

    switch (status) {
      case 401:
        return {
          message: 'Invalid credentials. Please check your email and password.',
          status: 401,
          isNetworkError: false,
        }
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          status: 403,
          isNetworkError: false,
        }
      case 404:
        return {
          message: 'The requested resource was not found.',
          status: 404,
          isNetworkError: false,
        }
      case 500:
        return {
          message: 'Internal server error. Please try again later or contact support.',
          status: 500,
          isNetworkError: false,
        }
      case 502:
      case 503:
      case 504:
        return {
          message: 'The server is temporarily unavailable. Please try again later.',
          status,
          isNetworkError: false,
        }
      default:
        return {
          message: `An unexpected error occurred (${status}). Please try again.`,
          status,
          isNetworkError: false,
        }
    }
  }

  // Non-Axios error
  return {
    message: 'An unexpected error occurred. Please try again.',
    isNetworkError: false,
  }
}

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError && error.response) {
    return error.response.status === 401 || error.response.status === 403
  }
  return false
} 
