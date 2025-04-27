import React, { useState } from 'react'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import type { LoginUser } from '../api/models'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState<LoginUser>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const handleChange =
    (field: keyof LoginUser) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authService.login(form)
      // on success the httpOnly cookie is set by the backend
      navigate('/competitions')
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h4" align="center">
          Referee Login
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          value={form.email}
          onChange={handleChange('email')}
        />
        <TextField
          label="Password"
          type="password"
          required
          fullWidth
          value={form.password}
          onChange={handleChange('password')}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Log In'}
        </Button>
      </Box>
    </Container>
  )
}

export default LoginPage
