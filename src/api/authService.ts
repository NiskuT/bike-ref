import { client } from './client'
import type { LoginUser } from './models'

// We expect the backend to set an httpOnly cookie on successful login.
export const authService = {
  login: (creds: LoginUser) =>
    client.post('/login', creds).then(r => r.data),
}
