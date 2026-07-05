import type { NextFunction, Request, Response } from 'express'
import { getSupabase } from '../services/supabase.service.js'

export type AdminActor = {
  id: string
  email: string
}

declare module 'express-serve-static-core' {
  interface Request {
    adminActor?: AdminActor
  }
}

/**
 * Verifies the caller's Supabase access token and requires role = admin
 * in agent_admin_users. Used for privileged user-management endpoints.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    res.status(503).json({ error: 'Supabase is not configured on the server', code: 'NO_SUPABASE' })
    return
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ error: 'Missing access token', code: 'UNAUTHORIZED' })
    return
  }

  const { data: userData, error } = await supabase.auth.getUser(token)
  if (error || !userData.user) {
    res.status(401).json({ error: 'Invalid or expired session', code: 'UNAUTHORIZED' })
    return
  }

  const { data: profile } = await supabase
    .from('agent_admin_users')
    .select('id, email, role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' })
    return
  }

  req.adminActor = { id: profile.id, email: profile.email }
  next()
}
