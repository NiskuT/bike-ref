import React from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook that provides convenient role-checking utilities
 * This acts as a feature flag system based on user roles
 */
export const useRoles = () => {
  const auth = useAuth()

  return {
    // Basic authentication
    isAuthenticated: auth.isAuthenticated,
    
    // Role checking
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    isAdmin: auth.isAdmin,
    
    // Feature flags for specific actions
    features: {
      canCreateCompetition: auth.canCreateCompetition(),
      canViewAllCompetitions: auth.isAdmin() || auth.hasRole('view:competitions'),
      canManageUsers: auth.isAdmin() || auth.hasRole('manage:users'),
    },
    
    // Competition-specific permissions
    competition: {
      canAccess: (competitionId: number, action: 'admin' | 'referee' = 'referee') => 
        auth.canAccessCompetition(competitionId, action),
      canAdmin: (competitionId: number) => 
        auth.canAccessCompetition(competitionId, 'admin'),
      canReferee: (competitionId: number) => 
        auth.canAccessCompetition(competitionId, 'referee'),
    },
    
    // User roles for debugging/display
    userRoles: auth.roles,
  }
}

/**
 * Simple feature flag component for conditional rendering
 */
interface FeatureProps {
  children: React.ReactNode
  requires?: {
    role?: string
    anyRole?: string[]
    admin?: boolean
    createCompetition?: boolean
    competitionAccess?: {
      competitionId: number
      action?: 'admin' | 'referee'
    }
  }
  fallback?: React.ReactNode
}

export const Feature: React.FC<FeatureProps> = ({ 
  children, 
  requires = {}, 
  fallback = null 
}) => {
  const auth = useAuth()

  // Check role requirement
  if (requires.role && !auth.hasRole(requires.role)) {
    return <>{fallback}</>
  }

  // Check any role requirement
  if (requires.anyRole && !auth.hasAnyRole(requires.anyRole)) {
    return <>{fallback}</>
  }

  // Check admin requirement
  if (requires.admin && !auth.isAdmin()) {
    return <>{fallback}</>
  }

  // Check create competition requirement
  if (requires.createCompetition && !auth.canCreateCompetition()) {
    return <>{fallback}</>
  }

  // Check competition access requirement
  if (requires.competitionAccess && !auth.canAccessCompetition(
    requires.competitionAccess.competitionId,
    requires.competitionAccess.action || 'referee'
  )) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 
