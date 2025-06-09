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
  Link,
} from '@mui/material'
import { LockReset as LockResetIcon, ArrowBack as BackIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import type { ForgotPasswordRequest } from '../api/models'
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState<ForgotPasswordRequest>({ email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ email: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setError(null)
    setLoading(true)
    
    try {
      await authService.forgotPassword(form)
      setSuccess(true)
    } catch (err: unknown) {
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
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
          <Avatar sx={{ bgcolor: 'success.main', mb: 2 }}>
            <LockResetIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
            {t('auth.forgotPassword.successTitle')}
          </Typography>
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {t('auth.forgotPassword.successMessage')}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 1 }}
          >
            {t('auth.forgotPassword.returnToLogin')}
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
        <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          {t('auth.forgotPassword.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {t('auth.forgotPassword.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('auth.forgotPassword.emailLabel')}
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendButton')}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <BackIcon fontSize="small" />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default ForgotPasswordPage 
