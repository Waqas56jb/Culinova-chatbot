import { Router } from 'express'
import { postChat, postChatStream } from '../controllers/chat.controller.js'
import { validateChatRequest } from '../middleware/validateChatRequest.js'

export const chatRouter = Router()

chatRouter.post('/', validateChatRequest, (req, res, next) => {
  postChat(req, res).catch(next)
})

chatRouter.post('/stream', validateChatRequest, (req, res, next) => {
  postChatStream(req, res).catch(next)
})
