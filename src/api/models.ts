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

// Participant model
export interface Participant {
  category: string
  competition_id: number
  dossard_number: number
  first_name: string
  last_name: string
}

// Live Ranking models
export interface RankingEntry {
  category: string
  chrono_sec: number
  dossard: number
  first_name: string
  last_name: string
  number_of_runs: number
  penality: number
  rank: number
  total_points: number
}

export interface LiveRankingResponse {
  category: string
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
