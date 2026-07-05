import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types'
import { ChatMessageBubble, ChatTypingIndicator } from '@/components/chat/ChatMessageBubble'

type ChatMessageListProps = {
  messages: ChatMessage[]
  isTyping: boolean
}

export function ChatMessageList({ messages, isTyping }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      <ChatTypingIndicator visible={isTyping} />
      <div ref={bottomRef} />
    </div>
  )
}
