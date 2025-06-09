import { client } from './client'
import type { Participant, ParticipantInput, ParticipantListResponse } from './models'

export const participantService = {
  getParticipant: (competitionId: number, dossard: number) =>
    client
      .get<Participant>(`/competition/${competitionId}/participant/${dossard}`)
      .then((r) => r.data),
      
  listParticipants: (competitionId: number, category?: string) => {
    const params = new URLSearchParams()
    if (category) {
      params.append('category', category)
    }
    
    const url = `/competition/${competitionId}/participants${params.toString() ? `?${params.toString()}` : ''}`
    return client
      .get<ParticipantListResponse>(url)
      .then((r) => r.data)
  },
  
  createParticipant: (participant: ParticipantInput) =>
    client
      .post<Participant>('/participant', participant)
      .then((r) => r.data),
      
  uploadParticipants: (competitionId: number, file: File) => {
    const formData = new FormData()
    formData.append('competitionID', competitionId.toString())
    formData.append('file', file)
    
    return client
      .post('/competition/participants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((r) => r.data)
  },
} 
