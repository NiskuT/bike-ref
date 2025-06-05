// src/pages/RunRegistrationPage.tsx
import React, { useState } from 'react'
import { Container, Box, Typography } from '@mui/material'
import { DoorGrid, DoorsState } from '../components/DoorGrid'
import { PenaltyCounter } from '../components/PenaltyCounter'
import { ChronoTimer } from '../components/ChronoTimer'
import { runService } from '../api/runService'
import { CustomSubmitButton } from '../components/CustomSubmitButton'


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
  const [doors, setDoors] = useState<DoorsState>({
    door1: false, door2: false, door3: false,
    door4: false, door5: false, door6: false,
  })
  const [penalty, setPenalty] = useState(0)
  const [chrono, setChrono] = useState(0)
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
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'grid', gap: 3 }}>
        {competitorName && (
          <Typography variant="h5" align="center">
            {competitorName}
          </Typography>
        )}

        <Typography variant="subtitle1">Portes</Typography>
        <DoorGrid doors={doors} onChange={setDoors} />

        <Typography variant="subtitle1">Pénalité</Typography>
        <PenaltyCounter value={penalty} onChange={setPenalty} />

        <Typography variant="subtitle1">Chrono</Typography>
        <ChronoTimer initial={0} onChange={setChrono} />

        <CustomSubmitButton loading={loading} label="Valider" />
      </Box>
    </Container>
  )
}
