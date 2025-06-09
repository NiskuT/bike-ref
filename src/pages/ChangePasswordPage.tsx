import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import type { ChangePasswordRequest } from '../api/models'
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState<ChangePasswordRequest>({
    current_password: '',
    new_password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field: keyof ChangePasswordRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.current_password.trim()) {
      setError('Please enter your current password.')
      return
    }

    if (!form.new_password.trim()) {
      setError('Please enter a new password.')
      return
    }

    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (form.new_password !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    if (form.current_password === form.new_password) {
      setError('New password must be different from current password.')
      return
    }

    setLoading(true)
    
    try {
      await authService.changePassword(form)
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
      <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/competitions')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
                      <Typography variant="h4" component="h1">
              {t('auth.changePassword.successTitle')}
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <LockIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('auth.changePassword.successSubtitle')}
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                {t('auth.changePassword.successMessage')}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/competitions')}
                fullWidth
              >
                {t('auth.changePassword.returnToCompetitions')}
              </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/competitions')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {t('auth.changePassword.title')}
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('auth.changePassword.currentPasswordLabel')}
              type={showCurrentPassword ? 'text' : 'password'}
              value={form.current_password}
              onChange={handleChange('current_password')}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('auth.changePassword.newPasswordLabel')}
              type={showNewPassword ? 'text' : 'password'}
              value={form.new_password}
              onChange={handleChange('new_password')}
              disabled={loading}
              helperText={t('auth.changePassword.passwordHelp')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('auth.changePassword.confirmPasswordLabel')}
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
              size="large"
            >
              {loading ? t('auth.changePassword.changing') : t('auth.changePassword.changeButton')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default ChangePasswordPage 
