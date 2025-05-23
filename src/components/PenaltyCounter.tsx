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
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
    <IconButton onClick={() => onChange(Math.max(0, value - 1))}>
      <RemoveIcon />
    </IconButton>
    <Typography variant="h6" sx={{ width: 32, textAlign: 'center' }}>
      {value}
    </Typography>
    <IconButton onClick={() => onChange(value + 1)}>
      <AddIcon />
    </IconButton>
  </Box>
)
