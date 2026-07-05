import { QUICK_ACTIONS } from '@/constants/chatConfig'

type ChatQuickActionsProps = {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function ChatQuickActions({ onSelect, disabled = false }: ChatQuickActionsProps) {
  return (
    <div className="chat-quick-actions" role="group" aria-label="Suggested questions">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          className="chat-quick-actions__btn"
          disabled={disabled}
          onClick={() => onSelect(action.prompt)}
        >
          <span className="chat-quick-actions__emoji" aria-hidden="true">
            {action.emoji}
          </span>
          {action.label}
        </button>
      ))}
    </div>
  )
}
