import type { ChatMessage } from '@/types'
import { ChatComposer } from '@/components/chat/ChatComposer'
import { ChatFooter } from '@/components/chat/ChatFooter'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatQuickActions } from '@/components/chat/ChatQuickActions'

type ChatConversationProps = {
  messages: ChatMessage[]
  isTyping: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSend: () => void
  onQuickAction: (prompt: string) => void
}

export function ChatConversation({
  messages,
  isTyping,
  inputValue,
  onInputChange,
  onSend,
  onQuickAction,
}: ChatConversationProps) {
  const showQuickActions = messages.length <= 1 && !isTyping

  return (
    <section className="chat-conversation" aria-label="Conversation">
      <ChatMessageList messages={messages} isTyping={isTyping} />

      {showQuickActions && (
        <ChatQuickActions onSelect={onQuickAction} disabled={isTyping} />
      )}

      <div className="chat-conversation__bottom">
        <ChatComposer
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          disabled={isTyping}
        />
        <ChatFooter />
      </div>
    </section>
  )
}
