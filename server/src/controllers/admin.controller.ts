import type { Request, Response } from 'express'
import { z } from 'zod'
import { getSupabase, writeAuditLog } from '../services/supabase.service.js'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().trim().min(1).max(120),
  role: z.enum(['admin', 'staff']),
})

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const changeRoleSchema = z.object({
  role: z.enum(['admin', 'staff']),
})

export async function listUsers(req: Request, res: Response): Promise<void> {
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('agent_admin_users')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json({
    users: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      createdAt: row.created_at,
    })),
  })
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' })
    return
  }

  const supabase = getSupabase()!
  const { email, password, fullName, role } = parsed.data

  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !created.user) {
    res.status(400).json({ error: authError?.message ?? 'User creation failed' })
    return
  }

  const { error: profileError } = await supabase.from('agent_admin_users').insert({
    id: created.user.id,
    email,
    full_name: fullName,
    role,
    created_by: req.adminActor?.id ?? null,
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(created.user.id)
    res.status(500).json({ error: profileError.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'user.created',
    target: email,
    detail: { role, fullName },
  })

  res.status(201).json({
    user: { id: created.user.id, email, fullName, role, createdAt: new Date().toISOString() },
  })
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const userId = String(req.params.id ?? '')
  if (!userId) {
    res.status(400).json({ error: 'User id is required' })
    return
  }
  if (userId === req.adminActor?.id) {
    res.status(400).json({ error: 'You cannot delete your own account' })
    return
  }

  const supabase = getSupabase()!

  const { data: target } = await supabase
    .from('agent_admin_users')
    .select('email')
    .eq('id', userId)
    .single()

  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'user.deleted',
    target: target?.email ?? userId,
  })

  res.json({ ok: true })
}

export async function resetUserPassword(req: Request, res: Response): Promise<void> {
  const userId = String(req.params.id ?? '')
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!userId || !parsed.success) {
    res.status(400).json({ error: parsed.success ? 'User id is required' : parsed.error.errors[0]?.message })
    return
  }

  const supabase = getSupabase()!
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: parsed.data.password,
  })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  const { data: target } = await supabase
    .from('agent_admin_users')
    .select('email')
    .eq('id', userId)
    .single()

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'user.password_reset',
    target: target?.email ?? userId,
  })

  res.json({ ok: true })
}

export async function changeUserRole(req: Request, res: Response): Promise<void> {
  const userId = String(req.params.id ?? '')
  const parsed = changeRoleSchema.safeParse(req.body)
  if (!userId || !parsed.success) {
    res.status(400).json({ error: 'Valid user id and role are required' })
    return
  }
  if (userId === req.adminActor?.id) {
    res.status(400).json({ error: 'You cannot change your own role' })
    return
  }

  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('agent_admin_users')
    .update({ role: parsed.data.role })
    .eq('id', userId)
    .select('email')
    .single()

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'user.role_changed',
    target: data?.email ?? userId,
    detail: { role: parsed.data.role },
  })

  res.json({ ok: true })
}
