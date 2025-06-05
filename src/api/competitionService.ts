// src/api/competitionService.ts
import { client } from './client'
import type { 
  CompetitionListResponse, 
  CompetitionResponse, 
  CompetitionInput, 
  ZoneInput, 
  ZoneListResponse,
  ZoneDeleteInput 
} from './models'

export const competitionService = {
  list: () =>
    client
      .get<CompetitionListResponse>('/competition')
      .then((r) => r.data.competitions),
      
  create: (competition: CompetitionInput) =>
    client
      .post<CompetitionResponse>('/competition', competition)
      .then((r) => r.data),
      
  addZone: (zone: ZoneInput) =>
    client
      .post('/competition/zone', zone)
      .then((r) => r.data),
      
  getZones: (competitionId: number) =>
    client
      .get<ZoneListResponse>(`/competition/${competitionId}/zones`)
      .then((r) => r.data),
      
  updateZone: (zone: ZoneInput) =>
    client
      .put('/competition/zone', zone)
      .then((r) => r.data),
      
  deleteZone: (zoneData: ZoneDeleteInput) =>
    client
      .delete('/competition/zone', { data: zoneData })
      .then((r) => r.data),
}
