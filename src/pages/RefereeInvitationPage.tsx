import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import { QrCodeScanner as QrIcon } from '@mui/icons-material'
import { useTranslation } from '../contexts/TranslationContext'
import { useAuth } from '../contexts/AuthContext'
import { refereeInvitationService } from '../api/refereeInvitationService'

export const RefereeInvitationPage: React.FC = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [showLoginRedirect, setShowLoginRedirect] = useState(false)

  // Form state for unauthenticated users
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  })

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError(t('invitation.error.noToken'))
      return
    }

    setLoading(true)
    setError('')
    
    try {
      if (isAuthenticated) {
        // Authenticated user flow
        await refereeInvitationService.acceptInvitation({ token })
      } else {
        // Unauthenticated user flow - validate form first
        if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
          setError(t('invitation.error.fillAllFields'))
          setLoading(false)
          return
        }
        
        await refereeInvitationService.acceptInvitationUnauthenticated({
          token,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
        })
      }
      
      setSuccess(true)
      
      // Redirect to competition list after 2 seconds
      setTimeout(() => {
        navigate('/competitions')
      }, 2000)
      
    } catch (err: any) {
      // Handle 401 error for authenticated users - session expired
      if (err.response?.status === 401 && isAuthenticated) {
        setError(t('invitation.error.sessionExpired'))
        // Show login redirect button
        setShowLoginRedirect(true)
      } else {
        setError(err.message || t('error.generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoginRedirect = () => {
    // Store the invitation token in localStorage to retry after login
    localStorage.setItem('pendingInvitationToken', token || '')
    navigate('/login')
  }

  useEffect(() => {
    // Check for pending invitation token from localStorage (after login redirect)
    const pendingToken = localStorage.getItem('pendingInvitationToken')
    if (pendingToken && !token) {
      // Redirect to invitation page with the stored token
      localStorage.removeItem('pendingInvitationToken')
      navigate(`/referee/invitation?token=${pendingToken}`)
      return
    }
    
    if (!token) {
      setError(t('invitation.error.noToken'))
    }
  }, [token, t, navigate])

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            ✓ {t('invitation.success.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('invitation.success.redirecting')}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <CircularProgress color="success" />
          </Box>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <QrIcon color="primary" />
          <Typography variant="h4">
            {t('invitation.title')}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          {t('invitation.description')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            {showLoginRedirect && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleLoginRedirect}
                sx={{ mt: 2, display: 'block' }}
              >
                {t('invitation.loginAgain')}
              </Button>
            )}
          </Alert>
        )}

        {!isAuthenticated && (
          <>
            <Typography variant="h6" gutterBottom>
              {t('invitation.createAccount')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('invitation.createAccountDescription')}
            </Typography>

            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t('common.email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={t('common.firstName')}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={t('common.lastName')}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={t('common.password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
            </Box>

            <Divider sx={{ my: 3 }} />
          </>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleAcceptInvitation}
          disabled={loading || !token}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isAuthenticated ? (
            t('invitation.acceptInvitation')
          ) : (
            t('invitation.createAccountAndAccept')
          )}
        </Button>

        {isAuthenticated && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
            {t('invitation.loggedInAs')}
          </Typography>
        )}
      </Paper>
    </Container>
  )
} 
