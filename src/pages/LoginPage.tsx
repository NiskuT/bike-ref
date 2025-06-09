// src/pages/LoginPage.tsx
import React, { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material'
import { DirectionsBike as BikeIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import type { LoginUser } from '../api/models'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'
import LanguageSelector from '../components/LanguageSelector'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setRoles } = useAuth()
  const { t } = useTranslation()
  const [form, setForm] = useState<LoginUser>({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange =
    (field: keyof LoginUser) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await authService.login(form)
      // Store the user's roles
      setRoles(response.roles)
      // On success, httpOnly cookie is set by backend and roles are stored
      navigate('/competitions')
    } catch (err: unknown) {
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageSelector />
      </Box>
      <Paper
        elevation={3}
        sx={{
          mt: { xs: 4, sm: 8 },
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
          <BikeIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          {t('auth.login.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          {t('auth.login.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('auth.login.emailLabel')}
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={handleChange('email')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('auth.login.passwordLabel')}
            type="password"
            id="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange('password')}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, mb: 1 }}
          >
            {loading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              sx={{
                color: 'primary.main',
                textDecoration: 'underline',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
            >
              {t('auth.login.forgotPassword')}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage
