import { client } from './client'
import type { LoginUser, LoginResponse, ForgotPasswordRequest, ChangePasswordRequest } from './models'

// We expect the backend to set an httpOnly cookie on successful login and return roles.
export const authService = {
  login: (creds: LoginUser): Promise<LoginResponse> =>
    client.put<LoginResponse>('/login', creds).then(r => r.data),
    
  logout: (): Promise<void> =>
    client.post('/logout').then(() => {
      // Clear any local storage or session data if needed
      localStorage.removeItem('userRoles')
      
      return Promise.resolve()
    }).catch(() => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('userRoles')
      return Promise.resolve()
    }),
  
  // Send forgot password email
  forgotPassword: (request: ForgotPasswordRequest): Promise<void> =>
    client.post('/auth/forgot-password', request).then(() => Promise.resolve()),
  
  // Change password for authenticated user
  changePassword: (request: ChangePasswordRequest): Promise<void> =>
    client.put('/auth/password', request).then(() => Promise.resolve()),
}
