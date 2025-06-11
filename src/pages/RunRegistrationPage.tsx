// src/pages/RunRegistrationPage.tsx
import React, { useState } from 'react'
import { Container, Box, Typography } from '@mui/material'
import { DoorGrid, DoorsState } from '../components/DoorGrid'
import { PenaltyCounter } from '../components/PenaltyCounter'
import { ChronoTimer } from '../components/ChronoTimer'
import { runService } from '../api/runService'
import { CustomSubmitButton } from '../components/CustomSubmitButton'
import { useTranslation } from '../contexts/TranslationContext'


interface RunRegistrationPageProps {
  competitionId: number
  dossard: number
  zone: string
  competitorName?: string
  onRunComplete?: (runData: any) => void
  hideNavigation?: boolean
}

export const RunRegistrationPage: React.FC<RunRegistrationPageProps> = ({
  competitionId, dossard, zone, competitorName, onRunComplete, hideNavigation: _hideNavigation
}) => {
  const { t } = useTranslation()
  const [doors, setDoors] = useState<DoorsState>({
    door1: false, door2: false, door3: false,
    door4: false, door5: false, door6: false,
  })
  const [penalty, setPenalty] = useState(0)
  const [chrono, setChrono] = useState(0)
  const [chronoRunning, setChronoRunning] = useState(false)
  const [chronoStarted, setChronoStarted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const runData = {
      competition_id: competitionId,
      dossard,
      zone,
      chrono_sec: chrono,
      penality: penalty,
      ...doors,
    }

    try {
      if (onRunComplete) {
        // Referee interface mode - just pass data back
        onRunComplete(runData)
      } else {
        // Legacy mode - submit directly
        await runService.create(runData)
        // Reset form on success
        setDoors({ door1:false,door2:false,door3:false,door4:false,door5:false,door6:false })
        setPenalty(0)
        setChrono(0)
      }
    } catch (err) {
      console.error(err)
      // TODO: show a Snackbar
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'grid', gap: 2 }}>
        {competitorName && (
          <Typography variant="h5" align="center">
            {competitorName}
          </Typography>
        )}

        <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
          {t('runRegistration.labels.chrono')}
        </Typography>
        <ChronoTimer 
          initial={0} 
          onChange={setChrono} 
          onRunningChange={(running) => {
            setChronoRunning(running)
            if (running && !chronoStarted) {
              setChronoStarted(true)
            }
          }}
          onReset={() => {
            setChronoStarted(false)
          }} 
        />

        <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
          {t('runRegistration.labels.doors')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <DoorGrid doors={doors} onChange={setDoors} disabled={!chronoStarted} />
        </Box>

        <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
          {t('runRegistration.labels.penalty')}
        </Typography>
        <PenaltyCounter value={penalty} onChange={setPenalty} />

        <CustomSubmitButton 
          loading={loading} 
          disabled={chronoRunning || loading}
          label={t('runRegistration.buttons.validate')} 
        />
      </Box>
    </Container>
  )
}
