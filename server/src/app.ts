import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { chatRouter } from './routes/chat.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { voiceRouter } from './routes/voice.routes.js'

export function createApp() {
  const app = express()

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  // Any localhost / private-LAN origin (any port) is fine outside production,
  // so dev servers on 5173..5199 and phones on the LAN all work.
  const devOriginPattern =
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        if (env.NODE_ENV !== 'production' && devOriginPattern.test(origin)) {
          return callback(null, true)
        }
        callback(null, false)
      },
      methods: ['GET', 'POST', 'OPTIONS'],
    }),
  )

  app.use(express.json({ limit: '1mb' }))

  app.get('/', (_req, res) => {
    res.json({
      name: 'Culinova Chatbot API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        chat: 'POST /api/chat',
        chatStream: 'POST /api/chat/stream',
        voiceSession: 'POST /api/voice/session',
      },
    })
  })

  app.use('/api/health', healthRouter)
  app.use('/api/chat', chatRouter)
  app.use('/api/voice', voiceRouter)

  app.use(errorHandler)

  return app
}
