import { Router } from 'express'
import { env } from '../config/env.js'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'culinova-chatbot-server',
    model: env.OPENAI_MODEL,
    timestamp: new Date().toISOString(),
  })
})
