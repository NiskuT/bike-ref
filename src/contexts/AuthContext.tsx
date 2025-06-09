import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../api/authService'

export interface AuthContextType {
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  canAccessCompetition: (competitionId: number, action: 'admin' | 'referee') => boolean
  canCreateCompetition: () => boolean
  isAdmin: () => boolean
  setRoles: (roles: string[]) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [roles, setRolesState] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Load roles from localStorage on app start
    const savedRoles = localStorage.getItem('userRoles')
    if (savedRoles) {
      try {
        const parsedRoles = JSON.parse(savedRoles)
        setRolesState(parsedRoles)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse saved roles:', error)
        localStorage.removeItem('userRoles')
      }
    }
    
    // Mark loading as complete
    setIsLoading(false)

    // Handle app visibility changes (mobile specific)
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // App became visible again, could verify auth status here if needed
        console.log('App became visible, user is authenticated')
        
        // Optional: You could add a periodic auth check here
        // but since your backend has auto-refresh, this might not be necessary
      }
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('Connection restored')
      // App came back online - auth should be handled by your backend auto-refresh
    }

    const handleOffline = () => {
      console.log('Connection lost')
      // Don't logout on offline - wait for connection to restore
    }

    // Add event listeners for mobile app lifecycle
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated])

  const setRoles = (newRoles: string[]) => {
    setRolesState(newRoles)
    setIsAuthenticated(newRoles.length > 0)
    
    // Save roles to localStorage
    if (newRoles.length > 0) {
      localStorage.setItem('userRoles', JSON.stringify(newRoles))
    } else {
      localStorage.removeItem('userRoles')
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with local cleanup even if server call fails
    } finally {
      // Clear local state
      setRolesState([])
      setIsAuthenticated(false)
      localStorage.removeItem('userRoles')
    }
  }

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return roles.includes(role)
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (rolesToCheck: string[]): boolean => {
    return rolesToCheck.some(role => roles.includes(role))
  }

  // Check if user is admin (has admin:* role)
  const isAdmin = (): boolean => {
    return roles.includes('admin:*')
  }

  // Check if user can access a specific competition
  const canAccessCompetition = (competitionId: number, action: 'admin' | 'referee'): boolean => {
    // Admin can access everything
    if (isAdmin()) {
      return true
    }

    // Check for specific competition access
    const competitionAdminRole = `admin:${competitionId}`
    const competitionRefereeRole = `referee:${competitionId}`

    if (action === 'admin') {
      return hasRole(competitionAdminRole)
    } else if (action === 'referee') {
      return hasAnyRole([competitionAdminRole, competitionRefereeRole])
    }

    return false
  }

  // Check if user can create competitions
  const canCreateCompetition = (): boolean => {
    return isAdmin() || hasRole('create:competition')
  }

  const value: AuthContextType = {
    roles,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    canAccessCompetition,
    canCreateCompetition,
    isAdmin,
    setRoles,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 
