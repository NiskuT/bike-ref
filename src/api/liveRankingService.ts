import { client } from './client'
import type { LiveRankingResponse } from './models'

export interface LiveRankingParams {
  competitionId: number
  page?: number
  page_size?: number
  category: string // REQUIRED
  gender: 'H' | 'F' // REQUIRED - H for men, F for women
}

export const liveRankingService = {
  getLiveRanking: ({ competitionId, page = 1, page_size = 20, category, gender }: LiveRankingParams) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      category,
      gender,
    })
    
    return client
      .get<LiveRankingResponse>(`/competition/${competitionId}/liveranking?${params.toString()}`)
      .then((r) => r.data)
  },
} 
