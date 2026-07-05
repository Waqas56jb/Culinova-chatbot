import { useCallback, useState } from 'react'
import { CHAT_CONFIG } from '@/constants/chatConfig'
import { getAssistantReply } from '@/lib/chatResponses'
import { streamChatMessage } from '@/services/chatApi'
import type { ChatMessage, ChatPhase } from '@/types'

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

export function useChat() {
  const [phase, setPhase] = useState<ChatPhase>('welcome')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const startConversation = useCallback(() => {
    setPhase('conversation')
    setMessages([createMessage('assistant', CHAT_CONFIG.initialMessage)])
  }, [])

  const resetChat = useCallback(() => {
    setPhase('welcome')
    setMessages([])
    setIsTyping(false)
    setInputValue('')
  }, [])

  const replyToUser = useCallback(
    async (text: string, historyOverride?: ChatMessage[]) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      const userMessage = createMessage('user', trimmed)
      const base = historyOverride ?? messages
      const nextMessages = [...base, userMessage]
      const assistantId = crypto.randomUUID()

      setMessages(nextMessages)
      setInputValue('')
      setIsTyping(true)

      try {
        const finalMessage = await streamChatMessage(nextMessages, (content) => {
          setIsTyping(false)
          setMessages((prev) => {
            const existing = prev.find((message) => message.id === assistantId)
            if (!existing) {
              return [
                ...prev,
                {
                  id: assistantId,
                  role: 'assistant' as const,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ]
            }
            return prev.map((message) =>
              message.id === assistantId ? { ...message, content } : message,
            )
          })
        })

        setMessages((prev) =>
          prev.map((message) => (message.id === assistantId ? finalMessage : message)),
        )
      } catch {
        const fallback = getAssistantReply(trimmed)
        setMessages((prev) => {
          const existing = prev.find((message) => message.id === assistantId)
          if (existing) {
            return prev.map((message) =>
              message.id === assistantId ? { ...message, content: fallback } : message,
            )
          }
          return [...prev, createMessage('assistant', fallback)]
        })
      } finally {
        setIsTyping(false)
      }
    },
    [isTyping, messages],
  )

  const sendMessage = useCallback(() => {
    void replyToUser(inputValue)
  }, [inputValue, replyToUser])

  const importVoiceTranscript = useCallback(
    (entries: { role: 'user' | 'assistant'; content: string }[]) => {
      if (entries.length === 0) return

      const transcriptMessages = entries.map((entry) => createMessage(entry.role, entry.content))

      setPhase('conversation')
      setMessages((prev) =>
        prev.length === 0
          ? [createMessage('assistant', CHAT_CONFIG.initialMessage), ...transcriptMessages]
          : [...prev, ...transcriptMessages],
      )
    },
    [],
  )

  const sendQuickAction = useCallback(
    (prompt: string) => {
      if (phase === 'welcome') {
        setPhase('conversation')
        const initial = [createMessage('assistant', CHAT_CONFIG.initialMessage)]
        void replyToUser(prompt, initial)
        return
      }
      void replyToUser(prompt)
    },
    [phase, replyToUser],
  )

  return {
    phase,
    messages,
    isTyping,
    inputValue,
    setInputValue,
    startConversation,
    resetChat,
    sendMessage,
    sendQuickAction,
    importVoiceTranscript,
  }
}
