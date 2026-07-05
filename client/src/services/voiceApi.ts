import { env } from '@/config/env'

export type VoiceSessionGrant = {
  clientSecret: string
  expiresAt: number | null
  model: string
  voice: string
}

export async function createVoiceSession(): Promise<VoiceSessionGrant> {
  const response = await fetch(`${env.apiUrl}/voice/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Voice session request failed: ${response.status}`)
  }

  return response.json() as Promise<VoiceSessionGrant>
}
