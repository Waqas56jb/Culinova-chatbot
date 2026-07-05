export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessageInput = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatMessageOutput = {
  id: string
  role: 'assistant'
  content: string
  createdAt: string
}

export type ChatRequestBody = {
  messages: ChatMessageInput[]
  sessionId?: string
}

export type ChatResponseBody = {
  message: ChatMessageOutput
}

export type ApiErrorBody = {
  error: string
  code?: string
}
