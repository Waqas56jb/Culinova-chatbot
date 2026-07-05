import { randomUUID } from 'node:crypto'
import { generateAssistantReply, streamAssistantReply } from './openai.service.js'
import type { ChatMessageInput, ChatMessageOutput } from '../types/chat.js'

export async function createChatReply(messages: ChatMessageInput[]): Promise<ChatMessageOutput> {
  const content = await generateAssistantReply(messages)

  return {
    id: randomUUID(),
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  }
}

export async function streamChatReply(
  messages: ChatMessageInput[],
  onDelta: (chunk: string) => void,
): Promise<ChatMessageOutput> {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  let content = ''

  for await (const chunk of streamAssistantReply(messages)) {
    content += chunk
    onDelta(chunk)
  }

  if (!content.trim()) {
    throw new Error('OpenAI returned an empty response')
  }

  return {
    id,
    role: 'assistant',
    content: content.trim(),
    createdAt,
  }
}
