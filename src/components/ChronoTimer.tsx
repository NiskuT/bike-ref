// src/components/ChronoTimer.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(initial * 1000) // Store in milliseconds
  const intervalRef = useRef<number | null>(null)

  // Use high-resolution timer for better accuracy
  const getCurrentTime = useCallback(() => {
    return performance.now()
  }, [])

  // Calculate current elapsed time based on real-time reference
  const updateTimer = useCallback(() => {
    if (!running || startTimeRef.current === null) return

    const now = getCurrentTime()
    const elapsedMs = now - startTimeRef.current + pausedTimeRef.current
    const currentSeconds = Math.floor(elapsedMs / 1000)
    
    if (currentSeconds !== seconds) {
      setSeconds(currentSeconds)
      onChange?.(currentSeconds)
    }
  }, [running, seconds, onChange, getCurrentTime])

  // Use more frequent updates for better precision
  useEffect(() => {
    if (running) {
      // Update more frequently (every 100ms) for smoother display
      intervalRef.current = window.setInterval(updateTimer, 100)
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
  }, [running, updateTimer])

  // Also use requestAnimationFrame for even better accuracy when tab is active
  useEffect(() => {
    let animationId: number

    const animate = () => {
      if (running) {
        updateTimer()
        animationId = requestAnimationFrame(animate)
      }
    }

    if (running) {
      animationId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [running, updateTimer])

  // Notify parent when running state changes
  useEffect(() => {
    onRunningChange?.(running)
  }, [running, onRunningChange])

  const start = () => {
    startTimeRef.current = getCurrentTime()
    setRunning(true)
  }

  const pause = () => {
    if (running && startTimeRef.current !== null) {
      const now = getCurrentTime()
      const elapsedMs = now - startTimeRef.current + pausedTimeRef.current
      pausedTimeRef.current = elapsedMs
    }
    setRunning(false)
  }

  const toggle = () => {
    if (running) {
      pause()
    } else {
      start()
    }
  }

  const reset = () => {
    setRunning(false)
    setSeconds(initial)
    startTimeRef.current = null
    pausedTimeRef.current = initial * 1000
    
    // Use timeout to avoid setState during render
    setTimeout(() => {
      onChange?.(initial)
      onReset?.()
    }, 0)
  }

  // Get current display time for accurate visual updates
  const getCurrentDisplayTime = () => {
    if (running && startTimeRef.current !== null) {
      const now = getCurrentTime()
      const elapsedMs = now - startTimeRef.current + pausedTimeRef.current
      return elapsedMs / 1000
    }
    return seconds
  }

  const totalSeconds = getCurrentDisplayTime()
  const mm = String(Math.floor(totalSeconds / 60)).padStart(1, '0')
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0')

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
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Typography variant="h3" fontWeight="bold" color='primary'>
          {mm}:{ss}
        </Typography>
      </Box>
      
      <IconButton 
        onClick={toggle}
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
