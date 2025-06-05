import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Fab,
} from '@mui/material'
import {
  SportsSoccer as RefereeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { competitionService } from '../api/competitionService'
import type { Zone, ZoneInput } from '../api/models'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errorHandling'

const ZoneListPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const { canAccessCompetition } = useAuth()
  
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null) // zone being deleted
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    zone: Zone | null
  }>({ open: false, zone: null })
  const [editForm, setEditForm] = useState<ZoneInput>({
    competition_id: 0,
    zone: '',
    category: '',
    points_door1: 0,
    points_door2: 0,
    points_door3: 0,
    points_door4: 0,
    points_door5: 0,
    points_door6: 0,
  })
  const [editLoading, setEditLoading] = useState(false)

  const competitionIdNum = Number(competitionId)
  const canAdminCompetition = canAccessCompetition(competitionIdNum, 'admin')
  const canRefereeCompetition = canAccessCompetition(competitionIdNum, 'referee')

  useEffect(() => {
    if (!competitionId) {
      setError('Invalid competition ID')
      setLoading(false)
      return
    }

    // Check if user has access to this competition
    if (!canRefereeCompetition) {
      setError('You do not have permission to access this competition.')
      setLoading(false)
      return
    }

    // Load zones
    competitionService
      .getZones(competitionIdNum)
      .then((response) => {
        setZones(response.zones)
      })
      .catch((err) => {
        console.error(err)
        const apiError = getErrorMessage(err)
        setError(apiError.message)
      })
      .finally(() => setLoading(false))
  }, [competitionId, competitionIdNum, canRefereeCompetition])

  const handleRefereeZone = (zone: Zone) => {
    // Navigate to referee interface for this zone
    // This would be implemented later when you create the referee flow
    console.log('Refereeing zone:', zone)
    // For now, we'll just log it - you can implement the actual referee interface later
    alert(`Referee mode for zone "${zone.zone}" - Category: ${zone.category}`)
  }

  const handleEditZone = (zone: Zone) => {
    setEditForm({
      competition_id: competitionIdNum,
      zone: zone.zone,
      category: zone.category,
      points_door1: zone.points_door1,
      points_door2: zone.points_door2,
      points_door3: zone.points_door3,
      points_door4: zone.points_door4,
      points_door5: zone.points_door5,
      points_door6: zone.points_door6,
    })
    setEditDialog({ open: true, zone })
  }

  const handleSaveEdit = async () => {
    setEditLoading(true)
    try {
      await competitionService.updateZone(editForm)
      
      // Update local state
      setZones(zones.map(z => 
        z.zone === editForm.zone && z.category === editForm.category
          ? { ...editForm } 
          : z
      ))
      
      setEditDialog({ open: false, zone: null })
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteZone = async (zone: Zone) => {
    if (!confirm(`Are you sure you want to delete zone "${zone.zone}" in category "${zone.category}"?`)) {
      return
    }

    setDeleteLoading(`${zone.zone}-${zone.category}`)
    try {
      await competitionService.deleteZone({
        competition_id: competitionIdNum,
        zone: zone.zone,
        category: zone.category,
      })
      
      // Remove from local state
      setZones(zones.filter(z => 
        !(z.zone === zone.zone && z.category === zone.category)
      ))
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEditFormChange = (field: keyof ZoneInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field.startsWith('points_door')) {
      setEditForm({
        ...editForm,
        [field]: parseInt(e.target.value, 10) || 0,
      })
    } else {
      setEditForm({ ...editForm, [field]: e.target.value })
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/competitions')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Competition Zones
        </Typography>
      </Box>

      {/* Zones Grid */}
      {zones.length === 0 ? (
        <Alert severity="info">
          No zones found for this competition.
        </Alert>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            justifyContent: 'flex-start'
          }}
        >
          {zones.map((zone) => (
            <Box 
              key={`${zone.zone}-${zone.category}`}
              sx={{ 
                flex: '1 1 calc(33.333% - 16px)',
                minWidth: '300px',
                maxWidth: '400px'
              }}
            >
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {zone.zone}
                  </Typography>
                  <Chip 
                    label={zone.category} 
                    color="primary" 
                    size="small" 
                    sx={{ mb: 2 }} 
                  />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Door Points:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {[1, 2, 3, 4, 5, 6].map(doorNum => (
                      <Chip
                        key={doorNum}
                        label={`D${doorNum}: ${zone[`points_door${doorNum}` as keyof Zone]}`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    {canRefereeCompetition && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefereeIcon />}
                        onClick={() => handleRefereeZone(zone)}
                        size="small"
                      >
                        Referee
                      </Button>
                    )}
                  </Box>
                  
                  {canAdminCompetition && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditZone(zone)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteZone(zone)}
                        disabled={deleteLoading === `${zone.zone}-${zone.category}`}
                        size="small"
                      >
                        {deleteLoading === `${zone.zone}-${zone.category}` ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Box>
                  )}
                                 </CardActions>
               </Card>
             </Box>
           ))}
         </Box>
       )}

      {/* Add Zone FAB - Only for admins */}
      {canAdminCompetition && (
        <Fab
          color="primary"
          aria-label="add zone"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate(`/competitions/${competitionId}/add-zone`)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Edit Zone Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, zone: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Zone: {editDialog.zone?.zone}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Zone Name"
              value={editForm.zone}
              onChange={handleEditFormChange('zone')}
              disabled // Zone name shouldn't be editable
              fullWidth
            />
            
            <TextField
              label="Category"
              value={editForm.category}
              onChange={handleEditFormChange('category')}
              disabled // Category shouldn't be editable
              fullWidth
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Points per Door
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[1, 2, 3, 4, 5, 6].map(doorNum => (
                <TextField
                  key={doorNum}
                  type="number"
                  label={`Door ${doorNum}`}
                  value={editForm[`points_door${doorNum}` as keyof ZoneInput]}
                  onChange={handleEditFormChange(`points_door${doorNum}` as keyof ZoneInput)}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: '1 1 30%', minWidth: '100px' }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, zone: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ZoneListPage 
