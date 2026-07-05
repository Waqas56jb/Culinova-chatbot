import type { Request, Response } from 'express'
import { z } from 'zod'
import { env } from '../config/env.js'
import { getSupabase, writeAuditLog } from '../services/supabase.service.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

const emailSchema = z.object({
  email: z.string().email(),
})

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type GoTrueTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user?: { id: string }
  error_description?: string
  msg?: string
}

async function goTrueToken(
  grant: 'password' | 'refresh_token',
  body: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: GoTrueTokenResponse }> {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as GoTrueTokenResponse
  return { ok: response.ok, status: response.status, data }
}

async function buildSessionPayload(data: GoTrueTokenResponse, res: Response): Promise<void> {
  const supabase = getSupabase()!
  const userId = data.user?.id
  if (!data.access_token || !userId) {
    res.status(401).json({ error: 'Sign-in failed' })
    return
  }

  const { data: profile } = await supabase
    .from('agent_admin_users')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    res.status(403).json({ error: 'This account has no admin panel access.' })
    return
  }

  res.json({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? '',
    expiresIn: data.expires_in ?? 3600,
    profile: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      createdAt: profile.created_at,
    },
  })
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid email and password are required' })
    return
  }

  const { ok, data } = await goTrueToken('password', parsed.data)
  if (!ok) {
    res.status(401).json({ error: data.error_description ?? data.msg ?? 'Invalid email or password' })
    return
  }

  await writeAuditLog({
    actorId: data.user?.id,
    actorEmail: parsed.data.email,
    action: 'auth.signed_in',
    target: 'admin panel',
  })

  await buildSessionPayload(data, res)
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'refreshToken is required' })
    return
  }

  const { ok, data } = await goTrueToken('refresh_token', {
    refresh_token: parsed.data.refreshToken,
  })
  if (!ok) {
    res.status(401).json({ error: 'Session expired. Please sign in again.' })
    return
  }

  await buildSessionPayload(data, res)
}

export async function logout(req: Request, res: Response): Promise<void> {
  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'auth.signed_out',
    target: 'admin panel',
  })
  res.json({ ok: true })
}

export async function changeOwnEmail(req: Request, res: Response): Promise<void> {
  const parsed = emailSchema.safeParse(req.body)
  if (!parsed.success || !req.adminActor) {
    res.status(400).json({ error: 'A valid email is required' })
    return
  }

  const supabase = getSupabase()!
  const { error } = await supabase.auth.admin.updateUserById(req.adminActor.id, {
    email: parsed.data.email,
    email_confirm: true,
  })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await supabase
    .from('agent_admin_users')
    .update({ email: parsed.data.email })
    .eq('id', req.adminActor.id)

  await writeAuditLog({
    actorId: req.adminActor.id,
    actorEmail: req.adminActor.email,
    action: 'account.email_changed',
    target: parsed.data.email,
  })

  res.json({ ok: true })
}

export async function changeOwnPassword(req: Request, res: Response): Promise<void> {
  const parsed = passwordSchema.safeParse(req.body)
  if (!parsed.success || !req.adminActor) {
    res.status(400).json({ error: parsed.success ? 'Not signed in' : parsed.error.errors[0]?.message })
    return
  }

  const supabase = getSupabase()!
  const { error } = await supabase.auth.admin.updateUserById(req.adminActor.id, {
    password: parsed.data.password,
  })
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor.id,
    actorEmail: req.adminActor.email,
    action: 'account.password_changed',
    target: req.adminActor.email,
  })

  res.json({ ok: true })
}
