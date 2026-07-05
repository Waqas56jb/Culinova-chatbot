import { useCallback, useState } from 'react'
import { CHAT_CONFIG } from '@/constants/chatConfig'
import { getAssistantReply } from '@/lib/chatResponses'
import type { ChatMessage, ChatPhase } from '@/types'

const TYPING_DELAY_MS = 700

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

  const replyToUser = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    setMessages((prev) => [...prev, createMessage('user', trimmed)])
    setInputValue('')
    setIsTyping(true)

    await new Promise((resolve) => setTimeout(resolve, TYPING_DELAY_MS))

    const reply = getAssistantReply(trimmed)
    setMessages((prev) => [...prev, createMessage('assistant', reply)])
    setIsTyping(false)
  }, [isTyping])

  const sendMessage = useCallback(() => {
    void replyToUser(inputValue)
  }, [inputValue, replyToUser])

  const sendQuickAction = useCallback(
    (prompt: string) => {
      if (phase === 'welcome') {
        setPhase('conversation')
        setMessages([createMessage('assistant', CHAT_CONFIG.initialMessage)])
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
  }
}
