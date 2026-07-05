import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import {
  changeUserRole,
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
} from '../controllers/admin.controller.js'
import {
  changeOwnEmail,
  changeOwnPassword,
  login,
  logout,
  refresh,
} from '../controllers/adminAuth.controller.js'
import {
  createTraining,
  deleteConversation,
  deleteLead,
  deleteTraining,
  getAllData,
  saveSettings,
  updateLead,
  updateTraining,
} from '../controllers/adminData.controller.js'
import { requireAdmin, requireMember } from '../middleware/requireAdmin.js'

type Handler = (req: Request, res: Response) => Promise<void>
type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void>

const wrap = (handler: Handler) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res).catch(next)
}

const guard = (middleware: Middleware) => (req: Request, res: Response, next: NextFunction) => {
  middleware(req, res, next).catch(next)
}

export const adminRouter = Router()

// Auth (public)
adminRouter.post('/auth/login', wrap(login))
adminRouter.post('/auth/refresh', wrap(refresh))
adminRouter.post('/auth/logout', guard(requireMember), wrap(logout))

// Own account (any member)
adminRouter.post('/account/email', guard(requireMember), wrap(changeOwnEmail))
adminRouter.post('/account/password', guard(requireMember), wrap(changeOwnPassword))

// Combined data feed (any member; admins get users/logs/settings too)
adminRouter.get('/data', guard(requireMember), wrap(getAllData))

// Leads
adminRouter.patch('/leads/:id', guard(requireMember), wrap(updateLead))
adminRouter.delete('/leads/:id', guard(requireAdmin), wrap(deleteLead))

// Conversations
adminRouter.delete('/conversations/:id', guard(requireAdmin), wrap(deleteConversation))

// Training
adminRouter.post('/training', guard(requireAdmin), wrap(createTraining))
adminRouter.patch('/training/:id', guard(requireAdmin), wrap(updateTraining))
adminRouter.delete('/training/:id', guard(requireAdmin), wrap(deleteTraining))

// Settings
adminRouter.put('/settings', guard(requireAdmin), wrap(saveSettings))

// User management (admins only)
adminRouter.get('/users', guard(requireAdmin), wrap(listUsers))
adminRouter.post('/users', guard(requireAdmin), wrap(createUser))
adminRouter.delete('/users/:id', guard(requireAdmin), wrap(deleteUser))
adminRouter.post('/users/:id/password', guard(requireAdmin), wrap(resetUserPassword))
adminRouter.patch('/users/:id/role', guard(requireAdmin), wrap(changeUserRole))
