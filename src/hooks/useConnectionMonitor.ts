import { useState, useEffect, useCallback } from 'react'

interface ConnectionStatus {
  isOnline: boolean
  wasOffline: boolean
  reconnectedAt: number | null
}

export const useConnectionMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
    reconnectedAt: null,
  })

  const [isAppVisible, setIsAppVisible] = useState(!document.hidden)

  // Handle online/offline events
  const handleOnline = useCallback(() => {
    setConnectionStatus(prev => ({
      isOnline: true,
      wasOffline: prev.wasOffline || !prev.isOnline,
      reconnectedAt: Date.now(),
    }))
  }, [])

  const handleOffline = useCallback(() => {
    setConnectionStatus(() => ({
      isOnline: false,
      wasOffline: true,
      reconnectedAt: null,
    }))
  }, [])

  // Handle app visibility changes
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden
    setIsAppVisible(isVisible)
    
    if (isVisible && connectionStatus.wasOffline && navigator.onLine) {
      // App became visible again and we have connection
      // Trigger a reconnection event
      handleOnline()
    }
  }, [connectionStatus.wasOffline, handleOnline])

  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleOnline, handleOffline, handleVisibilityChange])

  // Clear the "was offline" flag after a certain time
  useEffect(() => {
    if (connectionStatus.reconnectedAt) {
      const timer = setTimeout(() => {
        setConnectionStatus(prev => ({
          ...prev,
          wasOffline: false,
          reconnectedAt: null,
        }))
      }, 5000) // Clear flag after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [connectionStatus.reconnectedAt])

  return {
    isOnline: connectionStatus.isOnline,
    wasOffline: connectionStatus.wasOffline,
    justReconnected: connectionStatus.reconnectedAt !== null,
    isAppVisible,
    shouldRefreshData: connectionStatus.isOnline && connectionStatus.wasOffline && isAppVisible,
  }
} 
