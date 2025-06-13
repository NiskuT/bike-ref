import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material'
import { ArrowBack as BackIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import QRCode from 'qrcode'
import { useTranslation } from '../contexts/TranslationContext'
import { useAuth } from '../contexts/AuthContext'
import { refereeInvitationService } from '../api/refereeInvitationService'
import type { RefereeInvitationResponse } from '../api/models'

export const QRInvitationPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { canAccessCompetition } = useAuth()
  
  const [invitation, setInvitation] = useState<RefereeInvitationResponse | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const competitionIdNum = Number(competitionId)
  const canAdminCompetition = canAccessCompetition(competitionIdNum, 'admin')

  const generateInvitation = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await refereeInvitationService.getInvitation(competitionIdNum)
      setInvitation(response)
      
      // Generate QR code
      const invitationUrl = `${window.location.origin}/referee/invitation?token=${response.token}`
      const qrDataUrl = await QRCode.toDataURL(invitationUrl, {
        width: 300,
        margin: 2,
      })
      setQrCodeDataUrl(qrDataUrl)
      
      // Set up countdown timer - expires_at is now integer timestamp in seconds
      const expiresAtMs = response.expires_at * 1000 // Convert to milliseconds
      updateTimeLeft(expiresAtMs)
      
    } catch (err: any) {
      setError(err.message || t('error.generic'))
    } finally {
      setLoading(false)
    }
  }

  const updateTimeLeft = (expiresAtMs: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, expiresAtMs - now)
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }

    updateTimer()
    intervalRef.current = setInterval(updateTimer, 1000)
  }

  const formatTimeLeft = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!competitionId || !canAdminCompetition) {
      navigate('/competitions')
      return
    }
    
    generateInvitation()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [competitionId, competitionIdNum, canAdminCompetition, navigate])

  if (!canAdminCompetition) {
    return null // Will redirect in useEffect
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(`/competitions/${competitionId}/zones`)} 
          sx={{ mr: 2 }}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {t('competition.qrInvitation.title')}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {invitation && !loading && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {t('competition.qrInvitation.instructions')}
            </Typography>

            <Box 
              component="img"
              src={qrCodeDataUrl}
              alt="QR Code"
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                bgcolor: 'white',
                boxShadow: 2,
              }}
            />

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {t('competition.qrInvitation.expiresIn')}
              </Typography>
              <Typography 
                variant="h5" 
                color={timeLeft < 60000 ? 'error.main' : 'primary.main'}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {formatTimeLeft(timeLeft)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={generateInvitation}
              disabled={loading}
              size="large"
            >
              {t('competition.qrInvitation.regenerate')}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
              {t('competition.qrInvitation.description')}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  )
} 
