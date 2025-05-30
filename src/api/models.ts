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

// Zone Creation
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
