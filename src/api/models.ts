// src/api/models.ts

export interface RunInput {
  competition_id: number
  dossard: number
  zone: string
  chrono_sec?: number
  penality?: number
  door1?: boolean
  door2?: boolean
  door3?: boolean
  door4?: boolean
  door5?: boolean
  door6?: boolean
}

// Updated RunInput for referee interface
export interface RunSubmission {
  chrono_sec: number
  competition_id: number
  door1: boolean
  door2: boolean
  door3: boolean
  door4: boolean
  door5: boolean
  door6: boolean
  dossard: number
  penality: number
  zone: string
}

export interface RunResponse {
  run_number: number
  competition_id: number
  dossard: number
  zone: string
  chrono_sec: number
  penality: number
  door1: boolean
  door2: boolean
  door3: boolean
  door4: boolean
  door5: boolean
  door6: boolean
}

// Run with referee information (for admin management)
export interface RunWithReferee {
  chrono_sec: number
  competition_id: number
  door1: boolean
  door2: boolean
  door3: boolean
  door4: boolean
  door5: boolean
  door6: boolean
  dossard: number
  penality: number
  referee_id: number
  referee_name: string
  run_number: number
  zone: string
}

// Response for participant runs
export interface ParticipantRunsResponse {
  runs: RunWithReferee[]
}

// Run update model (for admin edits)
export interface RunUpdateInput {
  chrono_sec: number
  competition_id: number
  door1: boolean
  door2: boolean
  door3: boolean
  door4: boolean
  door5: boolean
  door6: boolean
  dossard: number
  penality: number
  run_number: number
  zone: string
}

// Participant model
export interface Participant {
  category: string
  competition_id: number
  dossard_number: number
  first_name: string
  last_name: string
  gender: 'H' | 'F' // H for men, F for women
  club?: string // Optional club field
}

// Participant creation model
export interface ParticipantInput {
  category: string
  competition_id: number
  dossard_number: number
  first_name: string
  last_name: string
  gender: 'H' | 'F' // H for men, F for women
  club?: string // Optional club field
}

// Participant list response
export interface ParticipantListResponse {
  participants: Participant[]
}

// Live Ranking models
export interface RankingEntry {
  category: string
  chrono_sec: number
  dossard: number
  first_name: string
  last_name: string
  gender: 'H' | 'F' // H for men, F for women
  number_of_runs: number
  penality: number
  rank: number
  total_points: number
  club?: string // Optional club field
}

export interface LiveRankingResponse {
  category: string
  gender: 'H' | 'F' // Gender filter applied 
  competition_id: number
  page: number
  page_size: number
  rankings: RankingEntry[]
  total: number
}

export interface LoginUser {
  email: string
  password: string
}

// Authentication Response
export interface LoginResponse {
  roles: string[]
}

// Password Reset Request
export interface ForgotPasswordRequest {
  email: string
}

// Change Password Request
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// src/api/models.ts
export interface CompetitionResponse {
  id: number
  name: string
  date: string       // ISO date
  location: string
  description: string
  organizer: string
  contact: string
}

export interface CompetitionListResponse {
  competitions: CompetitionResponse[]
}

// Competition Creation
export interface CompetitionInput {
  name: string
  date: string
  location: string
  description: string
  organizer: string
  contact: string
}

// Zone Creation/Update
export interface ZoneInput {
  competition_id: number
  zone: string
  category: string
  points_door1: number
  points_door2: number
  points_door3: number
  points_door4: number
  points_door5: number
  points_door6: number
}

// Zone from API (without competition_id as it's in the parent response)
export interface Zone {
  zone: string
  category: string
  points_door1: number
  points_door2: number
  points_door3: number
  points_door4: number
  points_door5: number
  points_door6: number
}

// Zone List Response
export interface ZoneListResponse {
  competition_id: number
  zones: Zone[]
}

// Zone Deletion
export interface ZoneDeleteInput {
  competition_id: number
  zone: string
  category: string
}

// Referee Management
export interface RefereeInput {
  competition_id: number
  email: string
  first_name: string
  last_name: string
}

// Referee Invitation via QR Code
export interface RefereeInvitationResponse {
  expires_at: number // Timestamp in seconds
  token: string
}

export interface AcceptInvitationRequest {
  token: string
}

export interface AcceptInvitationUnauthenticatedRequest {
  email: string
  first_name: string
  last_name: string
  password: string
  token: string
}
