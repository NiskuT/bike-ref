// src/api/runService.ts
import { client } from './client'
import type { RunInput, RunResponse } from './models'

export const runService = {
  createRun: (run: RunInput) =>
    client.post<RunResponse>('/run', run).then(r => r.data),
}
