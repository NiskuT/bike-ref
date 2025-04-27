// src/pages/CompetitionListPage.tsx
import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { competitionService } from '../api/competitionService'
import type { CompetitionResponse } from '../api/models'
import { format } from 'date-fns'

const CompetitionListPage: React.FC = () => {
  const [comps, setComps] = useState<CompetitionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    competitionService
      .list()
      .then(setComps)
      .catch((err) => {
        console.error(err)
        setError('Could not load competitions.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select a Competition
      </Typography>
      <List>
        {comps.map((c) => (
          <ListItemButton
            key={c.id}
            onClick={() =>
              navigate(
                `/competitions/${c.id}/participants` // adjust if your participant list route differs
              )
            }
          >
            <ListItemText
              primary={c.name}
              secondary={`${format(
                new Date(c.date),
                'PP'
              )} — ${c.location}`}
            />
          </ListItemButton>
        ))}
      </List>
    </Container>
  )
}

export default CompetitionListPage
