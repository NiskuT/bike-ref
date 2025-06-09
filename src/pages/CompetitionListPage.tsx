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
import { Add as AddIcon, Logout as LogoutIcon, DirectionsBike as BikeIcon, Lock as LockIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'
import LanguageSelector from '../components/LanguageSelector'

const CompetitionListPage: React.FC = () => {
  const [comps, setComps] = useState<CompetitionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const navigate = useNavigate()
  const { canCreateCompetition, logout } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    competitionService
      .list()
      .then(setComps)
      .catch((err) => {
        console.error(err)
        const apiError = getErrorMessage(err)
        setError(apiError.message)
      })
      .finally(() => setLoading(false))
  }, [])

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
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 4 }
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2,
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: { xs: 'center', sm: 'flex-start' }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
            }}>
              <BikeIcon 
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, 
                  color: 'primary.main' 
                }} 
              />
              <Typography 
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {t('competitions.title')}
              </Typography>
            </Box>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mt: 0.5,
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {t('competitions.subtitle')}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'stretch'
          }}>
            {canCreateCompetition() && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/new-competition')}
                size="small"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
              >
                {t('competitions.buttons.new')}
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LockIcon />}
              onClick={() => navigate('/change-password')}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
            >
              {t('competitions.buttons.password')}
            </Button>
            <LanguageSelector />
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              disabled={logoutLoading}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
            >
              {logoutLoading ? t('competitions.buttons.loggingOut') : t('competitions.buttons.logout')}
            </Button>
          </Box>
        </Box>
      
        <List>
          {comps.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              {canCreateCompetition() 
                ? t('competitions.noCompetitionsAdmin')
                : t('competitions.noCompetitions')
              }
            </Typography>
          ) : (
            comps.map((c) => (
              <ListItemButton
                key={c.id}
                onClick={() =>
                  navigate(
                    `/competitions/${c.id}/zones`
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
