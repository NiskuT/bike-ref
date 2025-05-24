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
  Button,
  Paper,
  Fab,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { competitionService } from '../api/competitionService'
import type { CompetitionResponse } from '../api/models'
import { format } from 'date-fns'
import { Add as AddIcon, Logout as LogoutIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errorHandling'

const CompetitionListPage: React.FC = () => {
  const [comps, setComps] = useState<CompetitionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const navigate = useNavigate()
  const { canCreateCompetition, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    competitionService
      .list()
      .then(setComps)
      .catch((err) => {
        console.error(err)
        const apiError = getErrorMessage(err)
        setError(apiError.message)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still navigate to login even if logout fails
      navigate('/login')
    } finally {
      setLogoutLoading(false)
    }
  }

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Competitions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canCreateCompetition() && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/new-competition')}
              >
                New
              </Button>
            )}
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? 'Signing out...' : 'Logout'}
            </Button>
          </Box>
        </Box>
      
        <List>
          {comps.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              {canCreateCompetition() 
                ? "No competitions found. Create a new one!" 
                : "No competitions found."
              }
            </Typography>
          ) : (
            comps.map((c) => (
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
            ))
          )}
        </List>
      </Paper>

      {/* Floating action button for mobile users - only show if user can create competitions */}
      {canCreateCompetition() && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/new-competition')}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  )
}

export default CompetitionListPage
