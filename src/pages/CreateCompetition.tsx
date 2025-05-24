import React, { useState } from 'react'
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { competitionService } from '../api/competitionService'
import type { CompetitionInput, ZoneInput } from '../api/models'
import { CustomSubmitButton } from '../components/CustomSubmitButton'

// Steps for the stepper
const steps = ['Competition Details', 'Add Zones']

const CreateCompetition: React.FC = () => {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Competition form state
  const [competition, setCompetition] = useState<CompetitionInput>({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    description: '',
    organizer: '',
    contact: '',
  })
  
  // Created competition ID after first step
  const [competitionId, setCompetitionId] = useState<number | null>(null)
  
  // Zones state
  const [zones, setZones] = useState<ZoneInput[]>([])
  const [currentZone, setCurrentZone] = useState<ZoneInput>({
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
  
  // Handle text input changes for the competition form
  const handleCompetitionChange = (field: keyof CompetitionInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCompetition({ ...competition, [field]: e.target.value })
  }
  
  // Handle zone form changes
  const handleZoneChange = (field: keyof ZoneInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // For number fields, convert to number type
    if (field.startsWith('points_door')) {
      setCurrentZone({
        ...currentZone,
        [field]: parseInt(e.target.value, 10) || 0,
      })
    } else {
      setCurrentZone({ ...currentZone, [field]: e.target.value })
    }
  }
  
  // Add a zone to the list
  const handleAddZone = () => {
    if (currentZone.zone.trim() === '' || currentZone.category.trim() === '') {
      setError('Zone name and category are required')
      return
    }
    
    const newZone = { ...currentZone, competition_id: competitionId! }
    setZones([...zones, newZone])
    
    // Reset form for next zone
    setCurrentZone({
      competition_id: competitionId!,
      zone: '',
      category: '',
      points_door1: 0,
      points_door2: 0,
      points_door3: 0,
      points_door4: 0,
      points_door5: 0,
      points_door6: 0,
    })
    
    setSuccessMessage('Zone added successfully')
    setTimeout(() => setSuccessMessage(null), 3000)
  }
  
  // Remove a zone from the list
  const handleRemoveZone = (index: number) => {
    const updatedZones = [...zones]
    updatedZones.splice(index, 1)
    setZones(updatedZones)
  }
  
  // Submit the competition details (first step)
  const handleSubmitCompetition = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const result = await competitionService.create(competition)
      setCompetitionId(result.id)
      setActiveStep(1)
      
      // Update current zone with competition ID
      setCurrentZone({ ...currentZone, competition_id: result.id })
      
      setSuccessMessage('Competition created successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error(err)
      setError('Failed to create competition. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Submit all zones and finish
  const handleSubmitZones = async () => {
    setError(null)
    setLoading(true)
    
    try {
      // Add current zone if it has content
      if (currentZone.zone.trim() !== '' && currentZone.category.trim() !== '') {
        zones.push({ ...currentZone, competition_id: competitionId! })
      }
      
      // Submit all zones sequentially
      for (const zone of zones) {
        await competitionService.addZone(zone)
      }
      
      setSuccessMessage('All zones added successfully')
      setTimeout(() => {
        navigate('/competitions')
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setError('Failed to add zones. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Render the competition form (first step)
  const renderCompetitionForm = () => (
    <Box component="form" onSubmit={handleSubmitCompetition} sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          required
          fullWidth
          label="Competition Name"
          value={competition.name}
          onChange={handleCompetitionChange('name')}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            required
            fullWidth
            label="Date"
            type="date"
            value={competition.date}
            onChange={handleCompetitionChange('date')}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: '1 1 45%', minWidth: '200px' }}
          />
          
          <TextField
            required
            fullWidth
            label="Location"
            value={competition.location}
            onChange={handleCompetitionChange('location')}
            sx={{ flex: '1 1 45%', minWidth: '200px' }}
          />
        </Box>
        
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={competition.description}
          onChange={handleCompetitionChange('description')}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            required
            fullWidth
            label="Organizer"
            value={competition.organizer}
            onChange={handleCompetitionChange('organizer')}
            sx={{ flex: '1 1 45%', minWidth: '200px' }}
          />
          
          <TextField
            required
            fullWidth
            label="Contact"
            value={competition.contact}
            onChange={handleCompetitionChange('contact')}
            sx={{ flex: '1 1 45%', minWidth: '200px' }}
          />
        </Box>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <CustomSubmitButton
          loading={loading}
          label="Create Competition"
        />
      </Box>
    </Box>
  )
  
  // Render the zones form (second step)
  const renderZonesForm = () => (
    <Box sx={{ mt: 3 }}>
      {/* Zone Creation Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Zone
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              required
              fullWidth
              label="Zone Name"
              value={currentZone.zone}
              onChange={handleZoneChange('zone')}
              sx={{ flex: '1 1 45%', minWidth: '200px' }}
            />
            
            <TextField
              required
              fullWidth
              label="Category"
              value={currentZone.category}
              onChange={handleZoneChange('category')}
              sx={{ flex: '1 1 45%', minWidth: '200px' }}
            />
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Points per Door
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[1, 2, 3, 4, 5, 6].map(doorNum => (
              <TextField
                key={doorNum}
                fullWidth
                type="number"
                label={`Door ${doorNum}`}
                value={currentZone[`points_door${doorNum}` as keyof ZoneInput]}
                onChange={handleZoneChange(`points_door${doorNum}` as keyof ZoneInput)}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ flex: '1 1 30%', minWidth: '100px' }}
              />
            ))}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddZone}
            sx={{ mt: 1, alignSelf: 'flex-start' }}
          >
            Add Zone
          </Button>
        </Box>
      </Paper>
      
      {/* List of Added Zones */}
      {zones.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Added Zones
          </Typography>
          
          <List>
            {zones.map((zone, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveZone(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={zone.zone}
                    secondary={`Category: ${zone.category}`}
                  />
                </ListItem>
                {index < zones.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Finish Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmitZones}
        disabled={loading || zones.length === 0}
        sx={{ mt: 2 }}
      >
        {loading ? 'Saving...' : 'Finish'}
      </Button>
    </Box>
  )
  
  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Create New Competition
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {activeStep === 0 ? renderCompetitionForm() : renderZonesForm()}
      </Paper>
    </Container>
  )
}

export default CreateCompetition 
