import { CulinovaLogo } from '@/components/branding/CulinovaLogo'
import { isEmbedMode, requestEmbedClose } from '@/lib/embedMode'

type ChatHeaderProps = {
  onClose: () => void
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  function handleClose() {
    onClose()
    if (isEmbedMode()) requestEmbedClose()
  }

  return (
    <header className="chat-header">
      <div className="chat-header__inner">
        <div className="chat-header__brand">
          <CulinovaLogo size="md" variant="full" className="chat-header__logo" />
          <span className="chat-header__label">Assistant</span>
        </div>

        <div className="chat-header__actions">
          <span className="chat-header__online">
            <span className="chat-header__online-dot" aria-hidden="true" />
            Online
          </span>
          <button
            type="button"
            className="chat-header__close"
            onClick={handleClose}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="chat-header__accent" aria-hidden="true" />
    </header>
  )
}
