import type { ReactNode } from 'react'

type ChatShellProps = {
  children: ReactNode
}

export function ChatShell({ children }: ChatShellProps) {
  return (
    <div className="chat-page">
      <div className="chat-page__backdrop" aria-hidden="true" />
      <div className="chat-shell">{children}</div>
    </div>
  )
}
