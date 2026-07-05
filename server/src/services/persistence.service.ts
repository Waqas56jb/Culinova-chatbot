import { getSupabase } from './supabase.service.js'
import type { ChatMessageInput } from '../types/chat.js'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const PHONE_RE = /(?:\+?\d[\d\s-]{7,15}\d)/

function detectLanguage(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return 'Arabic'
  return 'English'
}

/**
 * Persists the running conversation transcript and captures leads
 * (messages containing an email or phone number). Fire-and-forget:
 * failures never block the chat reply.
 */
export async function persistExchange(params: {
  sessionKey: string | undefined
  channel: 'chat' | 'voice'
  messages: ChatMessageInput[]
  assistantReply: string
}): Promise<void> {
  const supabase = getSupabase()
  if (!supabase || !params.sessionKey) return

  try {
    const transcript = [
      ...params.messages,
      { role: 'assistant' as const, content: params.assistantReply },
    ]

    const userMessages = params.messages.filter((m) => m.role === 'user')
    const lastUser = userMessages.at(-1)?.content ?? ''
    const allUserText = userMessages.map((m) => m.content).join('\n')
    const language = detectLanguage(allUserText)

    const email = allUserText.match(EMAIL_RE)?.[0] ?? ''
    const phone = allUserText.match(PHONE_RE)?.[0] ?? ''
    const leadCaptured = Boolean(email || phone)

    await supabase.from('agent_conversations').upsert(
      {
        session_key: params.sessionKey,
        visitor: `Visitor ${params.sessionKey.slice(0, 8)}`,
        channel: params.channel,
        language,
        messages_count: transcript.length,
        lead_captured: leadCaptured,
        transcript,
      },
      { onConflict: 'session_key' },
    )

    // Capture a lead only when new contact info appears in the latest message
    const newContact = EMAIL_RE.test(lastUser) || PHONE_RE.test(lastUser)
    if (newContact) {
      const { data: existing } = await supabase
        .from('agent_leads')
        .select('id')
        .or(
          [
            email ? `email.eq.${email}` : '',
            phone ? `phone.eq.${phone}` : '',
          ]
            .filter(Boolean)
            .join(','),
        )
        .limit(1)

      if (!existing || existing.length === 0) {
        await supabase.from('agent_leads').insert({
          name: `Visitor ${params.sessionKey.slice(0, 8)}`,
          email,
          phone,
          interest: userMessages[0]?.content.slice(0, 180) ?? '',
          source: params.channel,
          status: 'new',
        })
      }
    }
  } catch (error) {
    console.error('[persistence] failed:', error)
  }
}
