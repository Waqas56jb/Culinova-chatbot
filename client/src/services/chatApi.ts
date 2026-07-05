import { env } from '@/config/env'
import type { ChatMessage } from '@/types'

type ChatApiMessage = {
  role: 'user' | 'assistant'
  content: string
}

type StreamEvent =
  | { type: 'delta'; delta: string }
  | { type: 'done'; message: ChatMessage }
  | { type: 'error'; error: string }

function getSessionId(): string {
  const key = 'culinova-chat-session'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function toPayload(messages: ChatMessage[]): {
  messages: ChatApiMessage[]
  sessionId: string
} {
  return {
    messages: messages.map(({ role, content }) => ({ role, content })),
    sessionId: getSessionId(),
  }
}

function parseSseBlock(block: string): StreamEvent | null {
  const line = block
    .split('\n')
    .find((entry) => entry.startsWith('data: '))

  if (!line) return null

  try {
    return JSON.parse(line.slice(6)) as StreamEvent
  } catch {
    return null
  }
}

export async function streamChatMessage(
  messages: ChatMessage[],
  onUpdate: (content: string) => void,
): Promise<ChatMessage> {
  const response = await fetch(`${env.apiUrl}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(messages)),
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Stream body is empty')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let content = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const event = parseSseBlock(block)
      if (!event) continue

      if (event.type === 'delta') {
        content += event.delta
        onUpdate(content)
      }

      if (event.type === 'done') {
        return event.message
      }

      if (event.type === 'error') {
        throw new Error(event.error)
      }
    }
  }

  throw new Error('Stream ended without a completion event')
}
