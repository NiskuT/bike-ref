import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  Stack,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../contexts/TranslationContext'
import { runManagementService } from '../api/runManagementService'
import { getErrorMessage } from '../utils/errorHandling'
import { useAuth } from '../contexts/AuthContext'
import type { RunWithReferee, RunUpdateInput } from '../api/models'

const RunManagementPage: React.FC = () => {
  const { competitionId, dossard } = useParams<{ competitionId: string; dossard: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation()
  const { canAccessCompetition } = useAuth()

  const competitionIdNum = Number(competitionId)
  const dossardNum = Number(dossard)
  const canManageRuns = canAccessCompetition(competitionIdNum, 'admin')

  // State
  const [runs, setRuns] = useState<RunWithReferee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRun, setEditingRun] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<RunUpdateInput>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    run: RunWithReferee | null
    confirmed: boolean
  }>({ open: false, run: null, confirmed: false })

  useEffect(() => {
    if (!competitionId || !dossard) {
      setError('Invalid competition ID or dossard')
      setLoading(false)
      return
    }

    if (!canManageRuns) {
      setError('You do not have permission to manage runs in this competition.')
      setLoading(false)
      return
    }

    fetchRuns()
  }, [competitionId, dossard, canManageRuns])

  const fetchRuns = async () => {
    if (!dossard) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await runManagementService.getParticipantRuns(competitionIdNum, dossardNum)
      setRuns(response.runs)
    } catch (err) {
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (run: RunWithReferee) => {
    setEditingRun(run.run_number)
    setEditForm({
      chrono_sec: run.chrono_sec,
      competition_id: run.competition_id,
      door1: run.door1,
      door2: run.door2,
      door3: run.door3,
      door4: run.door4,
      door5: run.door5,
      door6: run.door6,
      dossard: run.dossard,
      penality: run.penality,
      run_number: run.run_number,
      zone: run.zone
    })
  }

  const handleEditCancel = () => {
    setEditingRun(null)
    setEditForm({})
  }

  const handleEditSave = async () => {
    if (!editForm.run_number) return
    
    setSaving(true)
    try {
      const updatedRun = await runManagementService.updateRun(editForm as RunUpdateInput)
      
      // Update the run in the local state
      setRuns(prevRuns =>
        prevRuns.map(run =>
          run.run_number === editForm.run_number
            ? { ...run, ...updatedRun }
            : run
        )
      )
      
      setEditingRun(null)
      setEditForm({})
    } catch (err) {
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (run: RunWithReferee) => {
    setDeleteDialog({ open: true, run, confirmed: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.run || !deleteDialog.confirmed) return
    
    setDeleting(true)
    try {
      await runManagementService.deleteRun(
        competitionIdNum,
        deleteDialog.run.dossard,
        deleteDialog.run.run_number
      )
      
      // Remove the run from local state
      setRuns(prevRuns =>
        prevRuns.filter(run => run.run_number !== deleteDialog.run?.run_number)
      )
      
      setDeleteDialog({ open: false, run: null, confirmed: false })
    } catch (err) {
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleEditFormChange = (field: keyof RunUpdateInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.type === 'number' 
        ? Number(event.target.value)
        : event.target.value

    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, '0')}`
  }

  const renderDoorsChips = (run: RunWithReferee) => {
    const doors = [
      { key: 'door1', value: run.door1 },
      { key: 'door2', value: run.door2 },
      { key: 'door3', value: run.door3 },
      { key: 'door4', value: run.door4 },
      { key: 'door5', value: run.door5 },
      { key: 'door6', value: run.door6 },
    ]

    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {doors.map((door, index) => (
          <Chip
            key={door.key}
            label={`D${index + 1}`}
            size="small"
            color={door.value ? 'success' : 'error'}
            variant="outlined"
          />
        ))}
      </Box>
    )
  }

  const renderDoorsEdit = () => {
    const doors = [
      { key: 'door1' as keyof RunUpdateInput },
      { key: 'door2' as keyof RunUpdateInput },
      { key: 'door3' as keyof RunUpdateInput },
      { key: 'door4' as keyof RunUpdateInput },
      { key: 'door5' as keyof RunUpdateInput },
      { key: 'door6' as keyof RunUpdateInput },
    ]

    return (
      <FormGroup row>
        {doors.map((door, index) => (
          <FormControlLabel
            key={door.key}
            control={
              <Checkbox
                checked={editForm[door.key] as boolean || false}
                onChange={handleEditFormChange(door.key)}
                size="small"
              />
            }
            label={`D${index + 1}`}
            sx={{ mr: 1 }}
          />
        ))}
      </FormGroup>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 4, sm: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error && !runs.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/competitions/${competitionId}/participants`)}
          >
            {t('common.buttons.back')}
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Container 
        maxWidth="lg" 
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
          mb: { xs: 2, sm: 3 }
        }}>
          <IconButton 
            onClick={() => navigate(`/competitions/${competitionId}/participants`)} 
            sx={{ 
              mr: { xs: 1, sm: 2 },
              p: { xs: 1, sm: 1.5 }
            }}
          >
            <BackIcon />
          </IconButton>
          <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                fontWeight: 500,
                lineHeight: 1.2
              }}
            >
              {t('participants.runManagement.title')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('participants.runManagement.participantInfo')} Dossard #{dossard}
            </Typography>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Runs Display */}
        {runs.length === 0 ? (
          <Alert severity="info">
            {t('participants.runManagement.noRuns')}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {runs.map((run) => (
              <Card key={run.run_number} elevation={2}>
                <CardContent>
                  {/* Card Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`${t('participants.runManagement.tableHeaders.runNumber')} ${run.run_number}`}
                        color="primary" 
                        size="small" 
                      />
                      <Chip 
                        label={run.zone}
                        color="secondary" 
                        variant="outlined"
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {run.referee_name}
                    </Typography>
                  </Box>

                  {/* Editable Fields */}
                  {editingRun === run.run_number ? (
                    <Stack spacing={2}>
                      {/* Time and Penalty */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
                        <TextField
                          label={t('participants.runManagement.editDialog.labels.time')}
                          size="small"
                          type="number"
                          value={editForm.chrono_sec || 0}
                          onChange={handleEditFormChange('chrono_sec')}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label={t('participants.runManagement.editDialog.labels.penalty')}
                          size="small"
                          type="number"
                          value={editForm.penality || 0}
                          onChange={handleEditFormChange('penality')}
                          inputProps={{ min: 0 }}
                          sx={{ flex: 1 }}
                        />
                      </Box>

                      {/* Doors */}
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          {t('participants.runManagement.editDialog.labels.doors')}
                        </Typography>
                        {renderDoorsEdit()}
                      </Box>
                    </Stack>
                  ) : (
                    <Stack spacing={1}>
                      {/* Time and Penalty Display */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 3,
                        flexWrap: 'wrap'
                      }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('participants.runManagement.tableHeaders.time')}
                          </Typography>
                          <Typography variant="h6">
                            {formatTime(run.chrono_sec)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('participants.runManagement.tableHeaders.penalty')}
                          </Typography>
                          <Typography variant="h6">
                            {run.penality} pts
                          </Typography>
                        </Box>
                      </Box>

                      {/* Doors Display */}
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('participants.runManagement.tableHeaders.doors')}
                        </Typography>
                        {renderDoorsChips(run)}
                      </Box>
                    </Stack>
                  )}
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  {editingRun === run.run_number ? (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleEditSave}
                        disabled={saving}
                      >
                        {t('participants.runManagement.buttons.save')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleEditCancel}
                        disabled={saving}
                      >
                        {t('participants.runManagement.buttons.cancel')}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditStart(run)}
                      >
                        {t('participants.runManagement.buttons.edit')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(run)}
                      >
                        {t('participants.runManagement.buttons.delete')}
                      </Button>
                    </Box>
                  )}
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, run: null, confirmed: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          {t('participants.runManagement.deleteDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('participants.runManagement.deleteDialog.warningMessage')}
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            {t('participants.runManagement.deleteDialog.message')}
          </Typography>
          
          {deleteDialog.run && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Run #{deleteDialog.run.run_number}</strong> - {deleteDialog.run.zone}
              </Typography>
              <Typography variant="body2">
                Time: {formatTime(deleteDialog.run.chrono_sec)} | Penalty: {deleteDialog.run.penality} pts
              </Typography>
            </Box>
          )}
          
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteDialog.confirmed}
                onChange={(e) =>
                  setDeleteDialog(prev => ({ ...prev, confirmed: e.target.checked }))
                }
              />
            }
            label={t('participants.runManagement.deleteDialog.confirmText')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, run: null, confirmed: false })}
            disabled={deleting}
          >
            {t('common.buttons.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={!deleteDialog.confirmed || deleting}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? t('common.loading.deleting') : t('participants.runManagement.deleteDialog.deleteButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RunManagementPage 
