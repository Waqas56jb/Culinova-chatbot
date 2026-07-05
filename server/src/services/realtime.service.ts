import { env } from '../config/env.js'
import { buildVoiceSystemPrompt } from '../prompts/system.prompt.js'

export type RealtimeSessionGrant = {
  clientSecret: string
  expiresAt: number | null
  model: string
  voice: string
}

/**
 * Mints a short-lived ephemeral client secret for the OpenAI Realtime API.
 * The browser uses it only for the WebRTC SDP exchange; the real API key
 * never leaves the server.
 */
export async function createRealtimeSession(): Promise<RealtimeSessionGrant> {
  const sessionConfig = {
    expires_after: { anchor: 'created_at', seconds: 120 },
    session: {
      type: 'realtime',
      model: env.OPENAI_REALTIME_MODEL,
      instructions: buildVoiceSystemPrompt(),
      audio: {
        input: {
          noise_reduction: { type: 'near_field' },
          transcription: { model: 'gpt-4o-mini-transcribe' },
          turn_detection: {
            type: 'semantic_vad',
            eagerness: 'medium',
            create_response: true,
            interrupt_response: true,
          },
        },
        output: {
          voice: env.OPENAI_REALTIME_VOICE,
        },
      },
    },
  }

  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionConfig),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Realtime session creation failed (${response.status}): ${detail}`)
  }

  const data = (await response.json()) as {
    value?: string
    expires_at?: number
    client_secret?: { value?: string; expires_at?: number }
  }

  const clientSecret = data.value ?? data.client_secret?.value
  if (!clientSecret) {
    throw new Error('Realtime session response did not include a client secret')
  }

  return {
    clientSecret,
    expiresAt: data.expires_at ?? data.client_secret?.expires_at ?? null,
    model: env.OPENAI_REALTIME_MODEL,
    voice: env.OPENAI_REALTIME_VOICE,
  }
}
