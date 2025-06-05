// src/api/runService.ts
import { client } from './client'
import type { RunInput, RunResponse, RunSubmission } from './models'

export const runService = {
  create: (run: RunInput) =>
    client
      .post<RunResponse>('/run', run)
      .then((r) => r.data),
      
  submit: (run: RunSubmission) =>
    client
      .post<RunResponse>('/run', run)
      .then((r) => r.data),
}
