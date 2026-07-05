import type { NextFunction, Request, Response } from 'express'
import { getSupabase } from '../services/supabase.service.js'

export type AdminActor = {
  id: string
  email: string
  role: 'admin' | 'staff'
}

declare module 'express-serve-static-core' {
  interface Request {
    adminActor?: AdminActor
  }
}

async function resolveActor(req: Request, res: Response): Promise<AdminActor | null> {
  const supabase = getSupabase()
  if (!supabase) {
    res.status(503).json({ error: 'Supabase is not configured on the server', code: 'NO_SUPABASE' })
    return null
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ error: 'Missing access token', code: 'UNAUTHORIZED' })
    return null
  }

  const { data: userData, error } = await supabase.auth.getUser(token)
  if (error || !userData.user) {
    res.status(401).json({ error: 'Invalid or expired session', code: 'UNAUTHORIZED' })
    return null
  }

  const { data: profile } = await supabase
    .from('agent_admin_users')
    .select('id, email, role')
    .eq('id', userData.user.id)
    .single()

  if (!profile) {
    res.status(403).json({ error: 'No admin panel access', code: 'FORBIDDEN' })
    return null
  }

  return { id: profile.id, email: profile.email, role: profile.role }
}

/** Any signed-in team member (admin or staff). */
export async function requireMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  const actor = await resolveActor(req, res)
  if (!actor) return
  req.adminActor = actor
  next()
}

/** Admins only. */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const actor = await resolveActor(req, res)
  if (!actor) return
  if (actor.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' })
    return
  }
  req.adminActor = actor
  next()
}
