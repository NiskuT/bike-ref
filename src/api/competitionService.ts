// src/api/competitionService.ts
import { client } from './client'
import type { CompetitionListResponse, CompetitionResponse, CompetitionInput, ZoneInput } from './models'

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
      .then((r) => r.data)
}
