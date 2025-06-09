import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Alert, Container, CircularProgress, Box } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRoles?: string[]
  requireCreateCompetition?: boolean
  requireCompetitionAccess?: {
    competitionId: number
    action: 'admin' | 'referee'
  }
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requireCreateCompetition = false,
  requireCompetitionAccess,
  fallbackPath = '/login'
}) => {
  const { 
    isAuthenticated, 
    isLoading,
    hasAnyRole, 
    canCreateCompetition, 
    canAccessCompetition 
  } = useAuth()

  // Show loading spinner while authentication state is being loaded
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Check authentication - only redirect if not loading and not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />
  }

  // Check specific roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
        </Alert>
      </Container>
    )
  }

  // Check competition creation permission
  if (requireCreateCompetition && !canCreateCompetition()) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          You don't have permission to create competitions. Required roles: admin:* or create:competition
        </Alert>
      </Container>
    )
  }

  // Check competition access permission
  if (requireCompetitionAccess && !canAccessCompetition(
    requireCompetitionAccess.competitionId, 
    requireCompetitionAccess.action
  )) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          You don't have permission to access this competition.
        </Alert>
      </Container>
    )
  }

  return <>{children}</>
} 
