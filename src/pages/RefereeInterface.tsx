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
  IconButton,
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
      setError('Invalid competition or zone data. Please return to the zone list.')
      return
    }

    if (!canRefereeCompetition) {
      setError('You do not have permission to referee this competition.')
      return
    }
  }, [competitionId, zoneData, canRefereeCompetition])

  const handleDossardSubmit = async () => {
    if (!state.dossard.trim()) {
      setError('Please enter a dossard number.')
      return
    }

    const dossardNum = parseInt(state.dossard.trim(), 10)
    if (isNaN(dossardNum) || dossardNum <= 0) {
      setError('Please enter a valid dossard number.')
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
      setError('Missing run data or participant information.')
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

  if (error && (!competitionId || !zoneData || !canRefereeCompetition)) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/competitions')}>
            Back to Competitions
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
              Enter Participant Dossard
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={`Zone: ${state.zone.zone}`} 
                color="primary" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={`Category: ${state.zone.category}`} 
                color="secondary" 
              />
            </Box>

            <TextField
              fullWidth
              label="Dossard Number"
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDossardSubmit}
                disabled={loading || !state.dossard.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
              >
                {loading ? 'Searching...' : 'Find Participant'}
              </Button>
            </Box>
          </Paper>
        )

      case 'participant-confirmation':
        return (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Confirm Participant
            </Typography>

            {state.participant && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    {state.participant.first_name} {state.participant.last_name}
                  </Typography>
                  <Typography color="text.secondary">
                    Dossard: {state.participant.dossard_number}
                  </Typography>
                  <Typography color="text.secondary">
                    Category: {state.participant.category}
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
                label={`Category: ${state.zone.category}`} 
                color="secondary" 
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              Would you like to proceed with registering a run for this participant?
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBackToDossard}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleParticipantConfirm}
                startIcon={<StartIcon />}
              >
                Start Run Registration
              </Button>
            </Box>
          </Paper>
        )

      case 'run-registration':
        return (
          <Box>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">
                  Run Registration
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2">
                  {state.participant?.first_name} {state.participant?.last_name} 
                  (#{state.participant?.dossard_number})
                </Typography>
                <Chip 
                  label={`${state.zone.zone} - ${state.zone.category}`} 
                  size="small"
                  color="primary" 
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleBackToDossard}
                sx={{ mt: 1 }}
              >
                Cancel & Back to Dossard Input
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
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Run Completed Successfully!
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              The run for {state.participant?.first_name} {state.participant?.last_name} 
              (#{state.participant?.dossard_number}) has been recorded.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Run & Continue'}
              </Button>
            </Box>
          </Paper>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBackToZones} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Referee Interface
        </Typography>
      </Box>

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
