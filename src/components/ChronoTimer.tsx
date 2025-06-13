// src/components/ChronoTimer.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ReplayIcon from '@mui/icons-material/Replay'

interface ChronoTimerProps {
  initial?: number  // seconds
  onChange?: (seconds: number) => void
  onRunningChange?: (isRunning: boolean) => void
  onReset?: () => void
}

export const ChronoTimer: React.FC<ChronoTimerProps> = ({ initial = 0, onChange, onRunningChange, onReset }) => {
  const [seconds, setSeconds] = useState(initial)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => {
          const next = s + 1
          // Use a timeout to avoid setState during render
          setTimeout(() => {
            onChange?.(next)
          }, 0)
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [running, onChange])

  // Notify parent when running state changes
  useEffect(() => {
    onRunningChange?.(running)
  }, [running, onRunningChange])

  const reset = () => {
    setRunning(false)
    setSeconds(initial)
    // Use timeout to avoid setState during render
    setTimeout(() => {
      onChange?.(initial)
      onReset?.()
    }, 0)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(1, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        mt: 0,
      }}
    >
      <IconButton 
        onClick={reset}
        size="large"
        sx={{ 
          width: 64, 
          height: 64,
          border: 1,
          borderColor: 'grey.300',
          bgcolor: 'grey.50',
          '&:hover': {
            bgcolor: 'grey.100',
          }
        }}
      >
        <ReplayIcon sx={{ fontSize: 32 }} />
      </IconButton>
      <Box
        sx={{
          border: 2,
          borderRadius: 2,
          borderColor: 'primary.main',
          px: 3,
          py: 2,
          minWidth: 120,
          textAlign: 'center',
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="primary">
          {mm}:{ss}
        </Typography>
      </Box>
      <IconButton 
        onClick={() => setRunning(r => !r)}
        size="large"
        sx={{ 
          width: 64, 
          height: 64,
          border: 1,
          borderColor: running ? 'warning.main' : 'success.main',
          bgcolor: running ? 'rgba(255, 193, 7, 0.1)' : 'rgba(76, 175, 80, 0.1)',
          '&:hover': {
            bgcolor: running ? 'rgba(255, 193, 7, 0.2)' : 'rgba(76, 175, 80, 0.2)',
          }
        }}
      >
        {running ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
      </IconButton>
    </Box>
  )
}
