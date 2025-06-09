import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  IconButton,
  Chip,
  Box,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { useTranslation } from '../contexts/TranslationContext'
import { runManagementService } from '../api/runManagementService'
import { getErrorMessage } from '../utils/errorHandling'
import type { Participant, RunWithReferee, RunUpdateInput } from '../api/models'

interface RunManagementDialogProps {
  open: boolean
  onClose: () => void
  participant: Participant | null
  competitionId: number
}

const RunManagementDialog: React.FC<RunManagementDialogProps> = ({
  open,
  onClose,
  participant,
  competitionId
}) => {
  const { t } = useTranslation()
  const [runs, setRuns] = useState<RunWithReferee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingRun, setEditingRun] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<RunUpdateInput>>({})
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    run: RunWithReferee | null
    confirmed: boolean
  }>({ open: false, run: null, confirmed: false })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch runs when dialog opens
  useEffect(() => {
    if (open && participant) {
      fetchRuns()
    }
  }, [open, participant])

  const fetchRuns = async () => {
    if (!participant) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await runManagementService.getParticipantRuns(competitionId, participant.dossard_number)
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
      // Success feedback could be added here
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
        competitionId,
        deleteDialog.run.dossard,
        deleteDialog.run.run_number
      )
      
      // Remove the run from local state
      setRuns(prevRuns =>
        prevRuns.filter(run => run.run_number !== deleteDialog.run?.run_number)
      )
      
      setDeleteDialog({ open: false, run: null, confirmed: false })
      // Success feedback could be added here
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

  const renderDoorsStatus = (run: RunWithReferee, isEditing: boolean = false) => {
    const doors = [
      { key: 'door1' as keyof RunUpdateInput, value: run.door1 },
      { key: 'door2' as keyof RunUpdateInput, value: run.door2 },
      { key: 'door3' as keyof RunUpdateInput, value: run.door3 },
      { key: 'door4' as keyof RunUpdateInput, value: run.door4 },
      { key: 'door5' as keyof RunUpdateInput, value: run.door5 },
      { key: 'door6' as keyof RunUpdateInput, value: run.door6 },
    ]

    if (isEditing) {
      return (
        <Box>
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
        </Box>
      )
    }

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

  if (!participant) return null

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box>
            <Typography variant="h6">
              {t('participants.runManagement.title')}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {t('participants.runManagement.participantInfo')} {participant.first_name} {participant.last_name} (#{participant.dossard_number})
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : runs.length === 0 ? (
            <Alert severity="info">
              {t('participants.runManagement.noRuns')}
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('participants.runManagement.tableHeaders.runNumber')}</TableCell>
                    <TableCell>{t('participants.runManagement.tableHeaders.zone')}</TableCell>
                    <TableCell>{t('participants.runManagement.tableHeaders.time')}</TableCell>
                    <TableCell>{t('participants.runManagement.tableHeaders.penalty')}</TableCell>
                    <TableCell>{t('participants.runManagement.tableHeaders.doors')}</TableCell>
                    <TableCell>{t('participants.runManagement.tableHeaders.referee')}</TableCell>
                    <TableCell>{t('participants.runManagement.tableHeaders.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.run_number}>
                      <TableCell>
                        <Chip label={run.run_number} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{run.zone}</TableCell>
                      <TableCell>
                        {editingRun === run.run_number ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editForm.chrono_sec || 0}
                            onChange={handleEditFormChange('chrono_sec')}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ width: 100 }}
                          />
                        ) : (
                          formatTime(run.chrono_sec)
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRun === run.run_number ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editForm.penality || 0}
                            onChange={handleEditFormChange('penality')}
                            inputProps={{ min: 0 }}
                            sx={{ width: 80 }}
                          />
                        ) : (
                          `${run.penality} pts`
                        )}
                      </TableCell>
                      <TableCell>
                        {renderDoorsStatus(run, editingRun === run.run_number)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {run.referee_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {editingRun === run.run_number ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={handleEditSave}
                              disabled={saving}
                            >
                              {saving ? <CircularProgress size={16} /> : <SaveIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleEditCancel}
                              disabled={saving}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditStart(run)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(run)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>
            {t('common.buttons.close')}
          </Button>
        </DialogActions>
      </Dialog>

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

export default RunManagementDialog 
