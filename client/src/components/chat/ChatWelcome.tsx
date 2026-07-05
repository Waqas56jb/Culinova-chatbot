import { CHAT_CONFIG } from '@/constants/chatConfig'
import { CulinovaLogo } from '@/components/branding/CulinovaLogo'

type ChatWelcomeProps = {
  onStart: () => void
}

export function ChatWelcome({ onStart }: ChatWelcomeProps) {
  return (
    <section className="chat-welcome" aria-label="Welcome">
      <div className="chat-welcome__panel">
        <div className="chat-welcome__logo">
          <CulinovaLogo size="hero" variant="full" />
        </div>

        <h2 className="chat-welcome__title">{CHAT_CONFIG.welcomeTitle}</h2>
        <p className="chat-welcome__description">{CHAT_CONFIG.welcomeDescription}</p>

        <div className="chat-welcome__divider" aria-hidden="true" />

        <button type="button" className="chat-welcome__cta" onClick={onStart}>
          <span className="chat-welcome__cta-icon" aria-hidden="true">
            +
          </span>
          {CHAT_CONFIG.startButtonLabel.toUpperCase()}
        </button>
      </div>
    </section>
  )
}
