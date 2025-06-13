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
  Snackbar,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import {
  SportsSoccer as RefereeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { competitionService } from '../api/competitionService'
import type { Zone, ZoneInput, RefereeInput } from '../api/models'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../contexts/TranslationContext'
import { getErrorMessage } from '../utils/errorHandling'

const ZoneListPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const { canAccessCompetition } = useAuth()
  const { t } = useTranslation()
  
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null) // zone being deleted
  
  // Zone dialog state (for both editing and creating)
  const [zoneDialog, setZoneDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    zone: Zone | null
  }>({ open: false, mode: 'create', zone: null })
  const [zoneForm, setZoneForm] = useState<ZoneInput>({
    competition_id: 0,
    zone: '',
    category: '',
    points_door1: '' as any, // Will be converted to number on submit
    points_door2: '' as any,
    points_door3: '' as any,
    points_door4: '' as any,
    points_door5: '' as any,
    points_door6: '' as any,
  })
  const [zoneFormLoading, setZoneFormLoading] = useState(false)

  // Zone action confirmation dialogs
  const [editWarningDialog, setEditWarningDialog] = useState<{
    open: boolean
    zone: Zone | null
    confirmed: boolean
  }>({ open: false, zone: null, confirmed: false })

  const [deleteWarningDialog, setDeleteWarningDialog] = useState<{
    open: boolean
    zone: Zone | null
    confirmed: boolean
  }>({ open: false, zone: null, confirmed: false })

  // Referee dialog state
  const [refereeDialog, setRefereeDialog] = useState(false)
  const [refereeForm, setRefereeForm] = useState<RefereeInput>({
    competition_id: 0,
    email: '',
    first_name: '',
    last_name: '',
  })
  const [refereeFormLoading, setRefereeFormLoading] = useState(false)
  const [refereeSuccessMessage, setRefereeSuccessMessage] = useState(false)

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
    // Navigate to referee interface with zone data
    navigate(`/competitions/${competitionId}/referee`, {
      state: { zone }
    })
  }

  const handleEditZone = (zone: Zone) => {
    setEditWarningDialog({ open: true, zone, confirmed: false })
  }

  const handleEditZoneConfirm = (zone: Zone) => {
    setZoneForm({
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
    setZoneDialog({ open: true, mode: 'edit', zone })
    setEditWarningDialog({ open: false, zone: null, confirmed: false })
  }

  const handleCreateZone = () => {
    setZoneForm({
      competition_id: competitionIdNum,
      zone: '',
      category: '',
      points_door1: '' as any,
      points_door2: '' as any,
      points_door3: '' as any,
      points_door4: '' as any,
      points_door5: '' as any,
      points_door6: '' as any,
    })
    setZoneDialog({ open: true, mode: 'create', zone: null })
  }

  const handleSaveZone = async () => {
    setZoneFormLoading(true)
    try {
      // Validate zone name and category
      if (!zoneForm.zone.trim() || !zoneForm.category.trim()) {
        setError(`${t('zones.labels.zoneName')} and ${t('zones.labels.category')} are required`)
        return
      }

      // Validate and convert door points
      const points1 = parseInt(String(zoneForm.points_door1), 10)
      const points2 = parseInt(String(zoneForm.points_door2), 10)
      const points3 = parseInt(String(zoneForm.points_door3), 10)
      const points4 = parseInt(String(zoneForm.points_door4), 10)
      const points5 = parseInt(String(zoneForm.points_door5), 10)
      const points6 = parseInt(String(zoneForm.points_door6), 10)
      
      if (isNaN(points1) || points1 <= 0 ||
          isNaN(points2) || points2 <= 0 ||
          isNaN(points3) || points3 <= 0 ||
          isNaN(points4) || points4 <= 0 ||
          isNaN(points5) || points5 <= 0 ||
          isNaN(points6) || points6 <= 0) {
        setError('Tous les points des portes doivent être remplis avec des valeurs strictement supérieures à 0')
        return
      }

      // Create validated zone object
      const validatedZoneForm = {
        ...zoneForm,
        points_door1: points1,
        points_door2: points2,
        points_door3: points3,
        points_door4: points4,
        points_door5: points5,
        points_door6: points6,
      }

      if (zoneDialog.mode === 'create') {
        await competitionService.addZone(validatedZoneForm)
        
        // Add to local state
        const newZone: Zone = {
          zone: validatedZoneForm.zone,
          category: validatedZoneForm.category,
          points_door1: validatedZoneForm.points_door1,
          points_door2: validatedZoneForm.points_door2,
          points_door3: validatedZoneForm.points_door3,
          points_door4: validatedZoneForm.points_door4,
          points_door5: validatedZoneForm.points_door5,
          points_door6: validatedZoneForm.points_door6,
        }
        setZones([...zones, newZone])
      } else {
        await competitionService.updateZone(validatedZoneForm)
        
        // Update local state
        setZones(zones.map(z => 
          z.zone === validatedZoneForm.zone && z.category === validatedZoneForm.category
            ? { ...validatedZoneForm } 
            : z
        ))
      }
      
      setZoneDialog({ open: false, mode: 'create', zone: null })
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setZoneFormLoading(false)
    }
  }

  const handleDeleteZone = (zone: Zone) => {
    setDeleteWarningDialog({ open: true, zone, confirmed: false })
  }

  const handleDeleteZoneConfirm = async (zone: Zone) => {
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
      
      setDeleteWarningDialog({ open: false, zone: null, confirmed: false })
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleZoneFormChange = (field: keyof ZoneInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field.startsWith('points_door')) {
      setZoneForm({
        ...zoneForm,
        [field]: e.target.value as any,
      })
    } else {
      setZoneForm({ ...zoneForm, [field]: e.target.value })
    }
  }

  const handleAddReferee = () => {
    setRefereeForm({
      competition_id: competitionIdNum,
      email: '',
      first_name: '',
      last_name: '',
    })
    setRefereeDialog(true)
  }

  const handleSaveReferee = async () => {
    setRefereeFormLoading(true)
    try {
      await competitionService.addReferee(refereeForm)
      setRefereeDialog(false)
      
      // Show success message
      setRefereeSuccessMessage(true)
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setRefereeFormLoading(false)
    }
  }

  const handleRefereeFormChange = (field: keyof RefereeInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRefereeForm({ ...refereeForm, [field]: e.target.value })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, sm: 8 } }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
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

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        mt: { xs: 3, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: { xs: 2, sm: 2 }
      }}>
        <IconButton 
          onClick={() => navigate('/competitions')} 
          sx={{ 
            mr: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 1.5 }
          }}
        >
          <BackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            fontWeight: 500,
            lineHeight: 1.2
          }}
        >
          {t('zones.title')}
        </Typography>
      </Box>
      
      {/* Action Buttons - mobile: stacked, desktop: separate row */}
      {canRefereeCompetition && (
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 1.5 }, 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          mb: { xs: 2, sm: 3 },
          flexWrap: 'wrap'
        }}>
          {canAdminCompetition && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<GroupIcon />}
                onClick={() => navigate(`/competitions/${competitionId}/participants`)}
                size="small"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  minWidth: { xs: 'auto', sm: '150px' },
                  whiteSpace: 'nowrap'
                }}
              >
                {t('zones.buttons.participants')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PersonAddIcon />}
                onClick={handleAddReferee}
                size="small"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  minWidth: { xs: 'auto', sm: '160px' },
                  whiteSpace: 'nowrap'
                }}
              >
                {t('zones.buttons.addReferee')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<QrCodeIcon />}
                onClick={() => navigate(`/competitions/${competitionId}/qr-invitation`)}
                size="small"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.5, sm: 0.75 },
                  minWidth: { xs: 'auto', sm: '160px' },
                  whiteSpace: 'nowrap'
                }}
              >
                {t('zones.buttons.qrInvite')}
              </Button>
            </>
          )}
          {canAdminCompetition && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<TrophyIcon />}
              onClick={() => navigate(`/competitions/${competitionId}/live-ranking`)}
              size="small"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                minWidth: { xs: 'auto', sm: '150px' },
                whiteSpace: 'nowrap'
              }}
            >
              {t('zones.buttons.liveRanking')}
            </Button>
          )}
        </Box>
      )}

      {/* Zones Grid */}
      {zones.length === 0 ? (
        <Alert severity="info">
          {t('zones.noZones')}
        </Alert>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 2, sm: 3 },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          {zones.map((zone) => (
            <Box 
              key={`${zone.zone}-${zone.category}`}
              sx={{ 
                flex: { 
                  xs: '1 1 100%', 
                  sm: '1 1 calc(50% - 12px)', 
                  md: '1 1 calc(33.333% - 16px)' 
                },
                minWidth: { xs: '280px', sm: '300px' },
                maxWidth: { xs: '400px', sm: '400px', md: '400px' }
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
                    Points par porte:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {[1, 2, 3, 4, 5, 6].map(doorNum => (
                      <Chip
                        key={doorNum}
                        label={`P${doorNum}: ${zone[`points_door${doorNum}` as keyof Zone]}`}
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
                        sx={{
                          minWidth: { xs: 'auto', sm: '120px' },
                          px: { xs: 1, sm: 1.5 }
                        }}
                      >
                        {t('zones.buttons.referee')}
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
          onClick={handleCreateZone}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Zone Dialog (Create/Edit) */}
      <Dialog 
        open={zoneDialog.open} 
        onClose={() => setZoneDialog({ open: false, mode: 'create', zone: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {zoneDialog.mode === 'create' ? t('zones.createZoneTitle') : `${t('zones.editZoneTitle')}: ${zoneDialog.zone?.zone}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('zones.labels.zoneName')}
              value={zoneForm.zone}
              onChange={handleZoneFormChange('zone')}
              disabled={zoneDialog.mode === 'edit'} // Zone name shouldn't be editable in edit mode
              fullWidth
              required
            />
            
            <TextField
              label={t('zones.labels.category')}
              value={zoneForm.category}
              onChange={handleZoneFormChange('category')}
              disabled={zoneDialog.mode === 'edit'} // Category shouldn't be editable in edit mode
              fullWidth
              required
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              {t('zones.labels.pointsDoor')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[1, 2, 3, 4, 5, 6].map(doorNum => (
                <TextField
                  key={doorNum}
                  type="number"
                  label={`${t('zones.labels.pointsDoor')} ${doorNum}`}
                  value={zoneForm[`points_door${doorNum}` as keyof ZoneInput]}
                  onChange={handleZoneFormChange(`points_door${doorNum}` as keyof ZoneInput)}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: '1 1 30%', minWidth: '100px' }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneDialog({ open: false, mode: 'create', zone: null })}>
            {t('common.buttons.cancel')}
          </Button>
          <Button 
            onClick={handleSaveZone} 
            variant="contained"
            disabled={zoneFormLoading}
          >
            {zoneFormLoading ? t('common.loading.saving') : (zoneDialog.mode === 'create' ? t('zones.buttons.createZone') : t('common.buttons.save'))}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Zone Warning Dialog */}
      <Dialog
        open={editWarningDialog.open}
        onClose={() => setEditWarningDialog({ open: false, zone: null, confirmed: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {t('zones.editWarningDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('zones.editWarningDialog.warningMessage')}
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            {t('zones.editWarningDialog.message')}
          </Typography>
          
          {editWarningDialog.zone && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{editWarningDialog.zone.zone}</strong> - {editWarningDialog.zone.category}
              </Typography>
            </Box>
          )}
          
          <FormControlLabel
            control={
              <Checkbox
                checked={editWarningDialog.confirmed}
                onChange={(e) =>
                  setEditWarningDialog(prev => ({ ...prev, confirmed: e.target.checked }))
                }
              />
            }
            label={t('zones.editWarningDialog.confirmText')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditWarningDialog({ open: false, zone: null, confirmed: false })}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={() => {
              if (editWarningDialog.confirmed && editWarningDialog.zone) {
                handleEditZoneConfirm(editWarningDialog.zone)
              }
            }}
            disabled={!editWarningDialog.confirmed}
            color="warning"
            variant="contained"
            startIcon={<EditIcon />}
          >
            {t('zones.editWarningDialog.editButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Zone Warning Dialog */}
      <Dialog
        open={deleteWarningDialog.open}
        onClose={() => setDeleteWarningDialog({ open: false, zone: null, confirmed: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          {t('zones.deleteWarningDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('zones.deleteWarningDialog.warningMessage')}
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            {t('zones.deleteWarningDialog.message')}
          </Typography>
          
          {deleteWarningDialog.zone && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>{deleteWarningDialog.zone.zone}</strong> - {deleteWarningDialog.zone.category}
              </Typography>
            </Box>
          )}
          
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteWarningDialog.confirmed}
                onChange={(e) =>
                  setDeleteWarningDialog(prev => ({ ...prev, confirmed: e.target.checked }))
                }
              />
            }
            label={t('zones.deleteWarningDialog.confirmText')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteWarningDialog({ open: false, zone: null, confirmed: false })}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={() => {
              if (deleteWarningDialog.confirmed && deleteWarningDialog.zone) {
                handleDeleteZoneConfirm(deleteWarningDialog.zone)
              }
            }}
            disabled={!deleteWarningDialog.confirmed || deleteLoading !== null}
            color="error"
            variant="contained"
            startIcon={deleteLoading !== null ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading !== null ? t('common.loading.deleting') : t('zones.deleteWarningDialog.deleteButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Referee Dialog */}
      <Dialog 
        open={refereeDialog} 
        onClose={() => setRefereeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('zones.addRefereeTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('zones.addRefereeLabels.email')}
              type="email"
              value={refereeForm.email}
              onChange={handleRefereeFormChange('email')}
              fullWidth
              required
              helperText="The referee will receive login credentials via email"
            />
            
            <TextField
              label={t('zones.addRefereeLabels.firstName')}
              value={refereeForm.first_name}
              onChange={handleRefereeFormChange('first_name')}
              fullWidth
              required
            />
            
            <TextField
              label={t('zones.addRefereeLabels.lastName')}
              value={refereeForm.last_name}
              onChange={handleRefereeFormChange('last_name')}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefereeDialog(false)}>
            {t('common.buttons.cancel')}
          </Button>
          <Button 
            onClick={handleSaveReferee} 
            variant="contained"
            disabled={refereeFormLoading || !refereeForm.email || !refereeForm.first_name || !refereeForm.last_name}
          >
            {refereeFormLoading ? t('common.loading.saving') : t('zones.buttons.addReferee')}
          </Button>
                 </DialogActions>
       </Dialog>

       {/* Success Message Snackbar */}
       <Snackbar
         open={refereeSuccessMessage}
         autoHideDuration={4000}
         onClose={() => setRefereeSuccessMessage(false)}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
       >
         <Alert 
           onClose={() => setRefereeSuccessMessage(false)} 
           severity="success" 
           variant="filled"
           sx={{ width: '100%' }}
         >
           {t('zones.addRefereeSuccess')}
         </Alert>
       </Snackbar>
     </Container>
   )
 }

export default ZoneListPage 
