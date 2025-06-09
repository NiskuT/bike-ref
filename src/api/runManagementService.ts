import { client } from './client'
import type { ParticipantRunsResponse, RunUpdateInput, RunResponse } from './models'

export const runManagementService = {
  /**
   * Get all runs for a specific participant (admin only)
   */
  getParticipantRuns: (competitionId: number, dossard: number) =>
    client
      .get<ParticipantRunsResponse>(`/competition/${competitionId}/participant/${dossard}/runs`)
      .then((r) => r.data),

  /**
   * Update a run (admin only)
   */
  updateRun: (runData: RunUpdateInput) =>
    client
      .put<RunResponse>('/run', runData)
      .then((r) => r.data),

  /**
   * Delete a run (admin only)
   */
  deleteRun: (competitionId: number, dossard: number, runNumber: number) => {
    const params = new URLSearchParams({
      competitionID: competitionId.toString(),
      dossard: dossard.toString(),
      runNumber: runNumber.toString(),
    })
    
    return client
      .delete(`/run?${params}`)
      .then((r) => r.data)
  }
} 
