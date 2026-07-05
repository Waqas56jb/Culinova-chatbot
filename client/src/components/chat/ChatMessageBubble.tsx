import type { ChatMessage as ChatMessageType } from '@/types'
import { CulinovaLogo } from '@/components/branding/CulinovaLogo'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'

type ChatMessageBubbleProps = {
  message: ChatMessageType
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <article
      className={`chat-message chat-message--${message.role}`}
      aria-label={isAssistant ? 'Assistant message' : 'Your message'}
    >
      {isAssistant && (
        <div className="chat-message__avatar">
          <CulinovaLogo size="sm" variant="full" />
        </div>
      )}

      <div className="chat-message__bubble">
        {isAssistant ? (
          <ChatMarkdown content={message.content} />
        ) : (
          <p className="chat-md__p chat-md__p--plain">{message.content}</p>
        )}
      </div>
    </article>
  )
}

type ChatTypingIndicatorProps = {
  visible: boolean
}

export function ChatTypingIndicator({ visible }: ChatTypingIndicatorProps) {
  if (!visible) return null

  return (
    <div className="chat-message chat-message--assistant" aria-label="Assistant is typing">
      <div className="chat-message__avatar">
        <CulinovaLogo size="sm" variant="full" />
      </div>
      <div className="chat-message__bubble chat-message__bubble--typing">
        <span className="chat-typing">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  )
}
