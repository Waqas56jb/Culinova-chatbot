import type { Request, Response } from 'express'
import { z } from 'zod'
import { getSupabase, writeAuditLog } from '../services/supabase.service.js'

/* ---------- row mappers (snake_case -> camelCase) ---------- */

function mapLead(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    company: String(row.company ?? ''),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    sector: String(row.sector ?? ''),
    interest: String(row.interest ?? ''),
    source: row.source ?? 'chat',
    status: row.status ?? 'new',
    createdAt: row.created_at,
  }
}

function mapConversation(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    visitor: String(row.visitor ?? 'Visitor'),
    channel: row.channel ?? 'chat',
    language: String(row.language ?? 'English'),
    startedAt: row.started_at,
    durationMin: Number(row.duration_min ?? 0),
    messagesCount: Number(row.messages_count ?? 0),
    leadCaptured: Boolean(row.lead_captured),
    satisfaction: Number(row.satisfaction ?? 0),
    transcript: Array.isArray(row.transcript) ? row.transcript : [],
  }
}

function mapTraining(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    category: String(row.category ?? 'Company'),
    content: String(row.content ?? ''),
    status: row.status ?? 'draft',
    updatedAt: String(row.updated_at ?? '').slice(0, 10),
  }
}

/* ---------- combined data feed ---------- */

export async function getAllData(req: Request, res: Response): Promise<void> {
  const supabase = getSupabase()!
  const isAdmin = req.adminActor?.role === 'admin'

  const [leadsRes, convRes, trainingRes] = await Promise.all([
    supabase.from('agent_leads').select('*').order('created_at', { ascending: false }).limit(500),
    supabase
      .from('agent_conversations')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(300),
    supabase.from('agent_training_entries').select('*').order('updated_at', { ascending: false }),
  ])

  const payload: Record<string, unknown> = {
    role: req.adminActor?.role,
    leads: (leadsRes.data ?? []).map(mapLead),
    conversations: (convRes.data ?? []).map(mapConversation),
    training: (trainingRes.data ?? []).map(mapTraining),
    users: [],
    logs: [],
    settings: {},
  }

  if (isAdmin) {
    const [usersRes, logsRes, settingsRes] = await Promise.all([
      supabase
        .from('agent_admin_users')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: true }),
      supabase
        .from('agent_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(400),
      supabase.from('agent_settings').select('data').eq('id', 1).single(),
    ])

    payload.users = (usersRes.data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      createdAt: row.created_at,
    }))
    payload.logs = (logsRes.data ?? []).map((row) => ({
      id: Number(row.id),
      actorEmail: String(row.actor_email ?? ''),
      action: String(row.action ?? ''),
      target: String(row.target ?? ''),
      detail: JSON.stringify(row.detail ?? {}),
      createdAt: row.created_at,
    }))
    payload.settings = settingsRes.data?.data ?? {}
  }

  res.json(payload)
}

/* ---------- leads ---------- */

const leadUpdateSchema = z
  .object({
    name: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    phone: z.string().max(60).optional(),
    email: z.string().max(200).optional(),
    sector: z.string().max(120).optional(),
    interest: z.string().max(500).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
  })
  .strict()

export async function updateLead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id ?? '')
  const parsed = leadUpdateSchema.safeParse(req.body)
  if (!id || !parsed.success) {
    res.status(400).json({ error: 'Invalid lead update' })
    return
  }

  const supabase = getSupabase()!
  const { error } = await supabase.from('agent_leads').update(parsed.data).eq('id', id)
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: parsed.data.status && Object.keys(parsed.data).length === 1 ? 'lead.status_changed' : 'lead.updated',
    target: id,
    detail: parsed.data,
  })

  res.json({ ok: true })
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id ?? '')
  const supabase = getSupabase()!
  const { error } = await supabase.from('agent_leads').delete().eq('id', id)
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'lead.deleted',
    target: id,
  })

  res.json({ ok: true })
}

/* ---------- conversations ---------- */

export async function deleteConversation(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id ?? '')
  const supabase = getSupabase()!
  const { error } = await supabase.from('agent_conversations').delete().eq('id', id)
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'conversation.deleted',
    target: id,
  })

  res.json({ ok: true })
}

/* ---------- training ---------- */

const trainingCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(60),
  content: z.string().trim().min(1).max(4000),
})

const trainingUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    category: z.string().trim().min(1).max(60).optional(),
    content: z.string().trim().min(1).max(4000).optional(),
    status: z.enum(['published', 'draft']).optional(),
  })
  .strict()

export async function createTraining(req: Request, res: Response): Promise<void> {
  const parsed = trainingCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Title, category, and content are required' })
    return
  }

  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('agent_training_entries')
    .insert({ ...parsed.data, status: 'draft' })
    .select('*')
    .single()

  if (error || !data) {
    res.status(400).json({ error: error?.message ?? 'Insert failed' })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'training.created',
    target: parsed.data.title,
  })

  res.status(201).json({ entry: mapTraining(data) })
}

export async function updateTraining(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id ?? '')
  const parsed = trainingUpdateSchema.safeParse(req.body)
  if (!id || !parsed.success) {
    res.status(400).json({ error: 'Invalid training update' })
    return
  }

  const supabase = getSupabase()!
  const { error } = await supabase
    .from('agent_training_entries')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'training.updated',
    target: id,
  })

  res.json({ ok: true })
}

export async function deleteTraining(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id ?? '')
  const supabase = getSupabase()!
  const { error } = await supabase.from('agent_training_entries').delete().eq('id', id)
  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'training.deleted',
    target: id,
  })

  res.json({ ok: true })
}

/* ---------- settings ---------- */

export async function saveSettings(req: Request, res: Response): Promise<void> {
  const data = req.body?.data
  if (!data || typeof data !== 'object') {
    res.status(400).json({ error: 'A settings data object is required' })
    return
  }

  const supabase = getSupabase()!
  const { error } = await supabase
    .from('agent_settings')
    .upsert({ id: 1, data, updated_at: new Date().toISOString() })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  await writeAuditLog({
    actorId: req.adminActor?.id,
    actorEmail: req.adminActor?.email,
    action: 'settings.saved',
    target: 'widget settings',
  })

  res.json({ ok: true })
}
