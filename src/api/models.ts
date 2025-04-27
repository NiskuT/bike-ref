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

// src/api/models.ts
export interface CompetitionResponse {
  id: number
  name: string
  date: string      // ISO string
  location: string
  description: string
  organizer: string
  contact: string
}

export interface CompetitionListResponse {
  competitions: CompetitionResponse[]
}
