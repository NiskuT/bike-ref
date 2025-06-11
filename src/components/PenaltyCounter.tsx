// src/components/PenaltyCounter.tsx
import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'

interface PenaltyCounterProps {
  value: number
  onChange: (v: number) => void
}

export const PenaltyCounter: React.FC<PenaltyCounterProps> = ({ value, onChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mt: 2 }}>
    <IconButton 
      onClick={() => onChange(Math.max(0, value - 1))}
      size="large"
      sx={{ 
        width: 64, 
        height: 64,
        border: 1,
        borderColor: 'error.main',
        bgcolor: 'rgba(244, 67, 54, 0.1)',
        '&:hover': {
          bgcolor: 'rgba(244, 67, 54, 0.2)',
        }
      }}
    >
      <RemoveIcon sx={{ fontSize: 32 }} />
    </IconButton>
    <Box
      sx={{
        border: 2,
        borderRadius: 2,
        borderColor: 'primary.main',
        px: 3,
        py: 2,
        minWidth: 80,
        textAlign: 'center',
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Typography variant="h3" fontWeight="bold" color="primary">
        {value}
      </Typography>
    </Box>
    <IconButton 
      onClick={() => onChange(value + 1)}
      size="large"
      sx={{ 
        width: 64, 
        height: 64,
        border: 1,
        borderColor: 'error.main',
        bgcolor: 'rgba(244, 67, 54, 0.1)',
        '&:hover': {
          bgcolor: 'rgba(244, 67, 54, 0.2)',
        }
      }}
    >
      <AddIcon sx={{ fontSize: 32 }} />
    </IconButton>
  </Box>
)
