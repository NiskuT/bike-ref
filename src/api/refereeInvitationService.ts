import { client } from './client'
import type { 
  RefereeInvitationResponse, 
  AcceptInvitationRequest, 
  AcceptInvitationUnauthenticatedRequest 
} from './models'

export const refereeInvitationService = {
  // Get invitation token for a competition
  getInvitation: (competitionId: number): Promise<RefereeInvitationResponse> =>
    client
      .get<RefereeInvitationResponse>(`/competition/${competitionId}/referee/invitation`)
      .then((r) => r.data),

  // Accept invitation for authenticated users
  acceptInvitation: (request: AcceptInvitationRequest): Promise<void> =>
    client
      .post('/referee/invitation/accept', request)
      .then(() => Promise.resolve()),

  // Accept invitation for unauthenticated users (registration + acceptance)
  acceptInvitationUnauthenticated: (request: AcceptInvitationUnauthenticatedRequest): Promise<void> =>
    client
      .post('/referee/invitation/accept-unauthenticated', request)
      .then(() => Promise.resolve()),
} 
