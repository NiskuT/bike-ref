// src/pages/RunRegistrationWrapper.tsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { RunRegistrationPage } from './RunRegistrationPage'

const RunRegistrationWrapper: React.FC = () => {
  const { competitionId = '1', dossard = '42' } =
    useParams<{ competitionId: string; dossard: string }>()

  // Mock values for demonstration
  const mockZone = "Zone A"
  const mockCompetitorName = "Jean Dupont"

  return (
    <RunRegistrationPage
      competitionId={Number(competitionId)}
      dossard={Number(dossard)}
      zone={mockZone}
      competitorName={mockCompetitorName}
    />
  )
}

export default RunRegistrationWrapper
