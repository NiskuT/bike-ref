import { client } from './client'
import type { LoginUser, LoginResponse } from './models'

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
}
