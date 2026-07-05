import type { Request, Response } from 'express'
import { createChatReply, streamChatReply } from '../services/chat.service.js'
import { persistExchange } from '../services/persistence.service.js'
import type { ChatRequestBody, ChatResponseBody } from '../types/chat.js'

export async function postChat(req: Request, res: Response): Promise<void> {
  const { messages, sessionId } = req.body as ChatRequestBody
  const message = await createChatReply(messages)

  void persistExchange({
    sessionKey: sessionId,
    channel: 'chat',
    messages,
    assistantReply: message.content,
  })

  const response: ChatResponseBody = { message }
  res.json(response)
}

export async function postChatStream(req: Request, res: Response): Promise<void> {
  const { messages, sessionId } = req.body as ChatRequestBody

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (payload: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  try {
    const message = await streamChatReply(messages, (delta) => {
      send({ type: 'delta', delta })
    })

    void persistExchange({
      sessionKey: sessionId,
      channel: 'chat',
      messages,
      assistantReply: message.content,
    })

    send({
      type: 'done',
      message,
    })
    res.end()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stream failed'
    send({ type: 'error', error: message })
    res.end()
  }
}
