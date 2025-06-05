import { client } from './client'
import type { Participant } from './models'

export const participantService = {
  getParticipant: (competitionId: number, dossard: number) =>
    client
      .get<Participant>(`/competition/${competitionId}/participant/${dossard}`)
      .then((r) => r.data),
} 
