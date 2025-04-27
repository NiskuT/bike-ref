// src/components/ChronoTimer.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ReplayIcon from '@mui/icons-material/Replay'

interface ChronoTimerProps {
  initial?: number  // seconds
  onChange?: (seconds: number) => void
}

export const ChronoTimer: React.FC<ChronoTimerProps> = ({ initial = 0, onChange }) => {
  const [seconds, setSeconds] = useState(initial)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => {
          const next = s + 1
          onChange?.(next)
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

  const reset = () => {
    setRunning(false)
    setSeconds(initial)
    onChange?.(initial)
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
