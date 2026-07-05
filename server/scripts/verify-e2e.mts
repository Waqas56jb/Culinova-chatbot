/** One-off end-to-end check: persists a test exchange, verifies rows, cleans up. */
import { persistExchange } from '../src/services/persistence.service.js'
import { getSupabase } from '../src/services/supabase.service.js'

const supabase = getSupabase()
if (!supabase) {
  console.error('Supabase is not configured.')
  process.exit(1)
}

const sessionKey = `e2e-verify-${Date.now()}`

await persistExchange({
  sessionKey,
  channel: 'chat',
  messages: [
    { role: 'user', content: 'I need a central kitchen. My email is e2e-test@example.com' },
  ],
  assistantReply: 'Thank you! Our team will contact you shortly.',
})

const { data: conv } = await supabase
  .from('agent_conversations')
  .select('id, session_key, messages_count, lead_captured, language')
  .eq('session_key', sessionKey)
  .single()

const { data: lead } = await supabase
  .from('agent_leads')
  .select('id, email, source, status')
  .eq('email', 'e2e-test@example.com')
  .limit(1)
  .single()

console.log('Conversation row:', conv)
console.log('Lead row:', lead)

// Clean up test rows
if (conv) await supabase.from('agent_conversations').delete().eq('id', conv.id)
if (lead) await supabase.from('agent_leads').delete().eq('id', lead.id)
console.log('Test rows cleaned up.')

if (conv && lead) {
  console.log('END-TO-END PERSISTENCE: OK')
} else {
  console.error('END-TO-END PERSISTENCE: FAILED')
  process.exit(1)
}
