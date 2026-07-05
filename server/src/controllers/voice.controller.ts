import type { Request, Response } from 'express'
import { createRealtimeSession } from '../services/realtime.service.js'

export async function postVoiceSession(_req: Request, res: Response): Promise<void> {
  const grant = await createRealtimeSession()

  res.json({
    clientSecret: grant.clientSecret,
    expiresAt: grant.expiresAt,
    model: grant.model,
    voice: grant.voice,
  })
}
