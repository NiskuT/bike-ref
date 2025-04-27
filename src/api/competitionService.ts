// src/api/competitionService.ts
import { client } from './client'
import type { CompetitionListResponse } from './models'

export const competitionService = {
  list: () =>
    client
      .get<CompetitionListResponse>('/competition')
      .then((r) => r.data.competitions),
}
