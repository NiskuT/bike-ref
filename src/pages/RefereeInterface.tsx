import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  PlayArrow as StartIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { participantService } from '../api/participantService'
import { runService } from '../api/runService'
import type { Participant, Zone, RunSubmission } from '../api/models'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'
import { RunRegistrationPage } from './RunRegistrationPage'

// Define the referee interface state
type RefereeStep = 'dossard-input' | 'participant-confirmation' | 'run-registration' | 'success'

interface RefereeState {
  competitionId: number
  zone: Zone
  step: RefereeStep
  dossard: string
  participant: Participant | null
  runData: any | null
}

const RefereeInterface: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { canAccessCompetition } = useAuth()
  const { t } = useTranslation()

  // Get zone and competition data from navigation state
  const zoneData = location.state?.zone as Zone
  const competitionIdNum = Number(competitionId)

  const [state, setState] = useState<RefereeState>({
    competitionId: competitionIdNum,
    zone: zoneData,
    step: 'dossard-input',
    dossard: '',
    participant: null,
    runData: null,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check permissions
  const canRefereeCompetition = canAccessCompetition(competitionIdNum, 'referee')

  useEffect(() => {
    if (!competitionId || !zoneData) {
      setError(t('referee.errors.invalidCompetition'))
      return
    }

    if (!canRefereeCompetition) {
      setError(t('common.errors.permission'))
      return
    }
  }, [competitionId, zoneData, canRefereeCompetition])

  const handleDossardSubmit = async () => {
    if (!state.dossard.trim()) {
      setError(t('referee.errors.invalidDossard'))
      return
    }

    const dossardNum = parseInt(state.dossard.trim(), 10)
    if (isNaN(dossardNum) || dossardNum <= 0) {
      setError(t('referee.errors.invalidDossard'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const participant = await participantService.getParticipant(competitionIdNum, dossardNum)
      setState(prev => ({
        ...prev,
        participant,
        step: 'participant-confirmation'
      }))
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantConfirm = () => {
    setState(prev => ({
      ...prev,
      step: 'run-registration'
    }))
  }

  const handleRunComplete = (runData: any) => {
    setState(prev => ({
      ...prev,
      runData,
      step: 'success'
    }))
  }

  const handleRunSubmit = async () => {
    if (!state.runData || !state.participant) {
      setError(t('referee.errors.missingData'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const runSubmission: RunSubmission = {
        chrono_sec: state.runData.chrono_sec || 0,
        competition_id: competitionIdNum,
        door1: state.runData.door1 || false,
        door2: state.runData.door2 || false,
        door3: state.runData.door3 || false,
        door4: state.runData.door4 || false,
        door5: state.runData.door5 || false,
        door6: state.runData.door6 || false,
        dossard: state.participant.dossard_number,
        penality: state.runData.penality || 0,
        zone: state.zone.zone,
      }

      await runService.submit(runSubmission)
      
      // Reset to initial state for next run
      setState(prev => ({
        ...prev,
        step: 'dossard-input',
        dossard: '',
        participant: null,
        runData: null,
      }))
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDossard = () => {
    setState(prev => ({
      ...prev,
      step: 'dossard-input',
      participant: null,
      runData: null,
    }))
    setError(null)
  }

  const handleBackToZones = () => {
    navigate(`/competitions/${competitionId}/zones`)
  }

  // Calculate total points based on doors passed and zone data
  const calculateTotalPoints = (): number => {
    if (!state.runData) return 0
    
    let total = 0
    if (state.runData.door1) total += state.zone.points_door1
    if (state.runData.door2) total += state.zone.points_door2
    if (state.runData.door3) total += state.zone.points_door3
    if (state.runData.door4) total += state.zone.points_door4
    if (state.runData.door5) total += state.zone.points_door5
    if (state.runData.door6) total += state.zone.points_door6
    
    return total
  }

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (error && (!competitionId || !zoneData || !canRefereeCompetition)) {
    return (
      <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/competitions')}>
            {t('common.buttons.back')}
          </Button>
        </Box>
      </Container>
    )
  }

  // Render different steps
  const renderContent = () => {
    switch (state.step) {
      case 'dossard-input':
        return (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('referee.steps.dossardInput')}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={`Zone: ${state.zone.zone}`} 
                color="primary" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={`${t('zones.labels.category')}: ${state.zone.category}`} 
                color="secondary" 
              />
            </Box>

            <TextField
              fullWidth
              label={t('referee.labels.dossardNumber')}
              type="number"
              value={state.dossard}
              onChange={(e) => setState(prev => ({ ...prev, dossard: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleDossardSubmit()
                }
              }}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mb: 3 }}
              autoFocus
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDossardSubmit}
                disabled={loading || !state.dossard.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                sx={{
                  minWidth: { xs: 'auto', sm: '200px' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {loading ? t('common.loading.loading') : t('referee.buttons.searchParticipant')}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBackToZones}
                startIcon={<BackIcon />}
                sx={{
                  minWidth: { xs: 'auto', sm: '200px' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {t('referee.buttons.backToZones')}
              </Button>
            </Box>
          </Paper>
        )

      case 'participant-confirmation':
        return (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('referee.steps.participantConfirmation')}
            </Typography>

            {state.participant && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    {state.participant.first_name} {state.participant.last_name}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('referee.labels.dossardNumber')}: {state.participant.dossard_number}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('referee.labels.category')}: {state.participant.category}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Box sx={{ mb: 3 }}>
              <Chip 
                label={`Zone: ${state.zone.zone}`} 
                color="primary" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={`${t('zones.labels.category')}: ${state.zone.category}`} 
                color="secondary" 
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {t('referee.steps.runConfiguration')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBackToDossard}
              >
                {t('common.buttons.back')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleParticipantConfirm}
                startIcon={<StartIcon />}
                sx={{
                  minWidth: { xs: 'auto', sm: '180px' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {t('referee.buttons.confirmParticipant')}
              </Button>
            </Box>
          </Paper>
        )

      case 'run-registration':
        return (
          <Box>
            <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
              {/* Mobile-first responsive header */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                gap: { xs: 1, sm: 2 },
                mb: { xs: 1, sm: 0 }
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 600
                  }}
                >
                  {t('referee.steps.runConfiguration')}
                </Typography>
                
                {/* Show divider only on larger screens */}
                <Divider 
                  orientation="vertical" 
                  flexItem 
                  sx={{ display: { xs: 'none', sm: 'block' } }} 
                />
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 0.5, sm: 1 },
                  flexWrap: 'wrap'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '0.875rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {state.participant?.first_name} {state.participant?.last_name} 
                    (#{state.participant?.dossard_number})
                  </Typography>
                  <Chip 
                    label={`${state.zone.zone} - ${state.zone.category}`} 
                    size="small"
                    color="primary"
                    sx={{ 
                      height: { xs: '24px', sm: '28px' },
                      fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                    }}
                  />
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                onClick={handleBackToDossard}
                sx={{ 
                  mt: { xs: 1, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                }}
              >
                {t('common.buttons.cancel')} & {t('common.buttons.back')}
              </Button>
            </Paper>
            
            <RunRegistrationPage 
              onRunComplete={handleRunComplete}
              competitionId={competitionIdNum}
              dossard={state.participant?.dossard_number || 0}
              zone={state.zone.zone}
              hideNavigation={true}
            />
          </Box>
        )

      case 'success':
        return (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {t('referee.success.title')}
              </Typography>
            </Box>

            {/* Participant Info */}
            {state.participant && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {state.participant.first_name} {state.participant.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('runRegistration.summary.dossard')}: #{state.participant.dossard_number}
                </Typography>
              </Box>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* Points Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('runRegistration.summary.pointsTitle')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {[1, 2, 3, 4, 5, 6].map(doorNum => {
                  const doorKey = `door${doorNum}`
                  const doorPassed = state.runData ? state.runData[doorKey] : false
                  const doorPoints = state.zone[`points_door${doorNum}` as keyof Zone] as number
                  
                  return (
                    <Chip
                      key={doorNum}
                      label={`P${doorNum}: ${doorPoints} pts`}
                      color={doorPassed ? 'success' : 'default'}
                      variant={doorPassed ? 'filled' : 'outlined'}
                      size="small"
                    />
                  )
                })}
              </Box>
              <Typography variant="h6" color="primary">
                {t('runRegistration.summary.totalPoints')}: {calculateTotalPoints()} {t('runRegistration.summary.points')}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Penalty and Time */}
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('runRegistration.labels.penalty')}
                </Typography>
                <Typography variant="h6">
                  {state.runData?.penality || 0} {t('runRegistration.summary.points')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('runRegistration.labels.chrono')}
                </Typography>
                <Typography variant="h6">
                  {formatTime(state.runData?.chrono_sec || 0)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleBackToDossard}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunSubmit}
                disabled={loading}
              >
                {loading ? t('common.loading.saving') : t('referee.buttons.submitRun')}
              </Button>
            </Box>
          </Paper>
        )

      default:
        return null
    }
  }

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {renderContent()}
    </Container>
  )
}

export default RefereeInterface 
