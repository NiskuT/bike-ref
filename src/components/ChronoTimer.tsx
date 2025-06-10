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
}

export const ChronoTimer: React.FC<ChronoTimerProps> = ({ initial = 0, onChange, onRunningChange }) => {
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
        gap: 2,
        mt: 1,
      }}
    >
      <IconButton onClick={reset}>
        <ReplayIcon />
      </IconButton>
      <Box
        sx={{
          border: 1,
          borderRadius: 1,
          px: 2,
          py: 1,
          minWidth: 80,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">
          {mm}:{ss}
        </Typography>
      </Box>
      <IconButton onClick={() => setRunning(r => !r)}>
        {running ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    </Box>
  )
}
