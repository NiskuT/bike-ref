// src/components/DoorGrid.tsx
import React from 'react'
import { Box, Button } from '@mui/material'

export type DoorKeys = 'door1'|'door2'|'door3'|'door4'|'door5'|'door6'
export type DoorsState = Record<DoorKeys, boolean>

interface DoorGridProps {
  doors: DoorsState
  onChange: (doors: DoorsState) => void
}

const LABELS: Record<DoorKeys,string> = {
  door1: 'P1', door2: 'P2', door3: 'P3',
  door4: 'P4', door5: 'P5', door6: 'P6',
}

export const DoorGrid: React.FC<DoorGridProps> = ({ doors, onChange }) => {
  const toggle = (key: DoorKeys) => {
    onChange({ ...doors, [key]: !doors[key] })
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        mt: 1,
      }}
    >
      { (Object.keys(doors) as DoorKeys[]).map((k) => (
        <Button
          key={k}
          onClick={() => toggle(k)}
          variant="contained"
          sx={{
            bgcolor: doors[k] ? 'success.main' : 'error.main',
            color: '#fff',
            width: 64,
            height: 64,
            fontSize: '1.1rem',
            '&:hover': {
              bgcolor: doors[k] ? 'success.dark' : 'error.dark',
            },
          }}
        >
          {LABELS[k]}
        </Button>
      )) }
    </Box>
  )
}
