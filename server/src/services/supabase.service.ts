import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, supabaseConfigured } from '../config/env.js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null
  if (!client) {
    client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}

export async function writeAuditLog(entry: {
  actorId?: string | null
  actorEmail?: string
  action: string
  target?: string
  detail?: Record<string, unknown>
}): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase.from('agent_audit_logs').insert({
    actor_id: entry.actorId ?? null,
    actor_email: entry.actorEmail ?? 'system',
    action: entry.action,
    target: entry.target ?? '',
    detail: entry.detail ?? {},
  })
}
