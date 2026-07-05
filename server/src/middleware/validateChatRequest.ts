import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1, 'Message content cannot be empty').max(4000),
})

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message is required').max(40),
  sessionId: z.string().trim().max(80).optional(),
})

export function validateChatRequest(req: Request, res: Response, next: NextFunction): void {
  const result = chatRequestSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({
      error: result.error.errors[0]?.message ?? 'Invalid request body',
      code: 'VALIDATION_ERROR',
    })
    return
  }

  const lastMessage = result.data.messages.at(-1)
  if (lastMessage?.role !== 'user') {
    res.status(400).json({
      error: 'The last message must be from the user',
      code: 'INVALID_TURN',
    })
    return
  }

  req.body = result.data
  next()
}
