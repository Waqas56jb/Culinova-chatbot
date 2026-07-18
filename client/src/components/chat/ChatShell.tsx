import type { ReactNode } from 'react'
import { isEmbedMode } from '@/lib/embedMode'

type ChatShellProps = {
  children: ReactNode
}

export function ChatShell({ children }: ChatShellProps) {
  const embed = isEmbedMode()

  return (
    <div className={embed ? 'chat-page chat-page--embed' : 'chat-page'}>
      {!embed && <div className="chat-page__backdrop" aria-hidden="true" />}
      <div className="chat-shell">{children}</div>
    </div>
  )
}
