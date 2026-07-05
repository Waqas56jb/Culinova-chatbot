import { Router } from 'express'
import { postVoiceSession } from '../controllers/voice.controller.js'

export const voiceRouter = Router()

voiceRouter.post('/session', (req, res, next) => {
  postVoiceSession(req, res).catch(next)
})
