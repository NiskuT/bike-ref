import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { participantService } from '../api/participantService'
import { competitionService } from '../api/competitionService'
import type { Participant, ParticipantInput, Zone } from '../api/models'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../utils/errorHandling'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`participant-tabpanel-${index}`}
      aria-labelledby={`participant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const ParticipantManagementPage: React.FC = () => {
  const { competitionId } = useParams<{ competitionId: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { canAccessCompetition } = useAuth()

  const competitionIdNum = Number(competitionId)
  const canManageParticipants = canAccessCompetition(competitionIdNum, 'admin')

  // State
  const [tabValue, setTabValue] = useState(0)
  const [zones, setZones] = useState<Zone[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Single participant state
  const [singleParticipantDialog, setSingleParticipantDialog] = useState(false)
  const [singleParticipantForm, setSingleParticipantForm] = useState<ParticipantInput>({
    category: '',
    competition_id: competitionIdNum,
    dossard_number: 0,
    first_name: '',
    last_name: '',
    gender: 'H',
  })
  const [creatingParticipant, setCreatingParticipant] = useState(false)

  // Get unique categories from zones
  const categories = zones.map(zone => zone.category)
    .filter((category, index, self) => self.indexOf(category) === index)
    .sort()

  useEffect(() => {
    if (!competitionId) {
      setError('Invalid competition ID')
      setLoading(false)
      return
    }

    if (!canManageParticipants) {
      setError('You do not have permission to manage participants in this competition.')
      setLoading(false)
      return
    }

    // Load zones to get categories
    competitionService
      .getZones(competitionIdNum)
      .then((response) => {
        setZones(response.zones)
        // Set first category as default if none selected
        if (!selectedCategory && response.zones.length > 0) {
          const firstCategory = response.zones[0].category
          setSelectedCategory(firstCategory)
          setSingleParticipantForm(prev => ({ ...prev, category: firstCategory }))
        }
      })
      .catch((err) => {
        console.error(err)
        const apiError = getErrorMessage(err)
        setError(apiError.message)
      })
      .finally(() => setLoading(false))
  }, [competitionId, competitionIdNum, canManageParticipants, selectedCategory])

  useEffect(() => {
    if (selectedCategory && !loading) {
      fetchParticipants()
    }
  }, [selectedCategory])

  const fetchParticipants = async () => {
    setParticipantsLoading(true)
    setError(null)

    try {
      const data = await participantService.listParticipants(competitionIdNum, selectedCategory)
      setParticipants(data.participants)
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setParticipantsLoading(false)
    }
  }

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value)
  }

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      await participantService.uploadParticipants(competitionIdNum, uploadFile)
      setUploadFile(null)
      
      // Refresh participants for current category
      await fetchParticipants()
      
      // Reset form
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSingleParticipantSubmit = async () => {
    if (!singleParticipantForm.first_name || !singleParticipantForm.last_name || 
        !singleParticipantForm.category || singleParticipantForm.dossard_number <= 0) {
      setError('Please fill in all required fields.')
      return
    }

    setCreatingParticipant(true)
    setError(null)

    try {
      await participantService.createParticipant(singleParticipantForm)
      
      // Reset form
      setSingleParticipantForm({
        category: selectedCategory,
        competition_id: competitionIdNum,
        dossard_number: 0,
        first_name: '',
        last_name: '',
        gender: 'H',
      })
      setSingleParticipantDialog(false)
      
      // Refresh participants if viewing the same category
      if (selectedCategory === singleParticipantForm.category) {
        await fetchParticipants()
      }
      
    } catch (err) {
      console.error(err)
      const apiError = getErrorMessage(err)
      setError(apiError.message)
    } finally {
      setCreatingParticipant(false)
    }
  }

  const handleOpenSingleParticipantDialog = () => {
    setSingleParticipantForm({
      category: selectedCategory,
      competition_id: competitionIdNum,
      dossard_number: 0,
      first_name: '',
      last_name: '',
      gender: 'H',
    })
    setSingleParticipantDialog(true)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !zones.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate(`/competitions/${competitionId}/zones`)}>
            Back to Zones
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3 },
        flexWrap: 'wrap',
        gap: { xs: 1, sm: 0 }
      }}>
        <IconButton 
          onClick={() => navigate(`/competitions/${competitionId}/zones`)} 
          sx={{ 
            mr: { xs: 1, sm: 2 },
            p: { xs: 1, sm: 1.5 }
          }}
        >
          <BackIcon />
        </IconButton>
        <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            fontWeight: 500,
            lineHeight: 1.2,
            flexGrow: 1
          }}
        >
          Participant Management
        </Typography>
      </Box>

      {/* Category Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }}>
          <InputLabel>Select Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Select Category"
            onChange={handleCategoryChange}
            size="small"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          <Tab icon={<UploadIcon />} label="File Upload" />
          <Tab icon={<PersonIcon />} label="Single Entry" />
          <Tab icon={<GroupIcon />} label="View Participants" />
        </Tabs>

        {/* File Upload Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Upload Participants from File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a CSV or XLSX file with 5 columns in this exact order: Dossard Number, Category, Last Name, First Name, Gender (H/F)
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              <Box>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    fullWidth={isMobile}
                  >
                    {uploadFile ? uploadFile.name : 'Choose File'}
                  </Button>
                </label>
              </Box>

              <Button
                variant="contained"
                onClick={handleFileUpload}
                disabled={!uploadFile || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                fullWidth={isMobile}
              >
                {uploading ? 'Uploading...' : 'Upload Participants'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Single Entry Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Add Single Participant
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenSingleParticipantDialog}
              fullWidth={isMobile}
            >
              Add New Participant
            </Button>
          </Box>
        </TabPanel>

        {/* View Participants Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Participants in {selectedCategory}
              </Typography>
              <Chip 
                label={`${participants.length} participants`} 
                color="primary" 
                size="small" 
              />
            </Box>

            {participantsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : participants.length === 0 ? (
              <Alert severity="info">
                No participants found for this category.
              </Alert>
            ) : isMobile ? (
              // Mobile Card View
              <Stack spacing={2}>
                {participants.map((participant) => (
                  <Card key={participant.dossard_number} elevation={1}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {participant.first_name} {participant.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Category: {participant.category} • {participant.gender === 'H' ? 'Men' : 'Women'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`#${participant.dossard_number}`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              // Desktop Table View
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dossard</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Gender</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.dossard_number}>
                        <TableCell>
                          <Chip 
                            label={participant.dossard_number}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{participant.first_name}</TableCell>
                        <TableCell>{participant.last_name}</TableCell>
                        <TableCell>{participant.category}</TableCell>
                        <TableCell>
                          <Chip 
                            label={participant.gender === 'H' ? 'Men' : 'Women'}
                            color={participant.gender === 'H' ? 'primary' : 'secondary'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Single Participant Dialog */}
      <Dialog 
        open={singleParticipantDialog} 
        onClose={() => setSingleParticipantDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Participant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl>
              <InputLabel>Category</InputLabel>
              <Select
                value={singleParticipantForm.category}
                label="Category"
                onChange={(e) => setSingleParticipantForm(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="First Name"
              value={singleParticipantForm.first_name}
              onChange={(e) => setSingleParticipantForm(prev => ({ ...prev, first_name: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Last Name"
              value={singleParticipantForm.last_name}
              onChange={(e) => setSingleParticipantForm(prev => ({ ...prev, last_name: e.target.value }))}
              required
              fullWidth
            />

            <TextField
              label="Dossard Number"
              type="number"
              value={singleParticipantForm.dossard_number || ''}
              onChange={(e) => setSingleParticipantForm(prev => ({ ...prev, dossard_number: parseInt(e.target.value) || 0 }))}
              InputProps={{ inputProps: { min: 1 } }}
              required
              fullWidth
            />

            <FormControl>
              <InputLabel>Gender</InputLabel>
              <Select
                value={singleParticipantForm.gender}
                label="Gender"
                onChange={(e) => setSingleParticipantForm(prev => ({ ...prev, gender: e.target.value as 'H' | 'F' }))}
              >
                <MenuItem value="H">Men (H)</MenuItem>
                <MenuItem value="F">Women (F)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSingleParticipantDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSingleParticipantSubmit} 
            variant="contained"
            disabled={creatingParticipant}
          >
            {creatingParticipant ? 'Creating...' : 'Add Participant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ParticipantManagementPage 
