import type { KeyboardEvent } from 'react'
import { CHAT_CONFIG } from '@/constants/chatConfig'

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onVoiceStart: () => void
  disabled?: boolean
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  onVoiceStart,
  disabled = false,
}: ChatComposerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="chat-composer">
      <div className="chat-composer__field">
        <textarea
          className="chat-composer__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={CHAT_CONFIG.inputPlaceholder}
          rows={1}
          disabled={disabled}
          aria-label="Message input"
        />

        <button
          type="button"
          className="chat-composer__mic"
          onClick={onVoiceStart}
          disabled={disabled}
          aria-label="Start voice conversation"
          title="Voice conversation"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 15.5a3.25 3.25 0 0 0 3.25-3.25v-6a3.25 3.25 0 0 0-6.5 0v6A3.25 3.25 0 0 0 12 15.5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 11.5a6.5 6.5 0 0 1-13 0M12 18v3.25M9 21.25h6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="chat-composer__send"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 19.5V5M5.5 11.5L12 5l6.5 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
