import type { NextFunction, Request, Response } from 'express'

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[server error]', error)

  if (res.headersSent) return

  const message = error instanceof Error ? error.message : 'Internal server error'

  if (message.includes('API key') || message.includes('Incorrect API key')) {
    res.status(503).json({
      error: 'AI service is not configured correctly. Check OPENAI_API_KEY.',
      code: 'AI_CONFIG_ERROR',
    })
    return
  }

  if (message.includes('rate limit') || message.includes('429')) {
    res.status(429).json({
      error: 'AI service is busy. Please try again in a moment.',
      code: 'RATE_LIMIT',
    })
    return
  }

  res.status(500).json({
    error: 'Something went wrong while generating a reply.',
    code: 'INTERNAL_ERROR',
  })
}
