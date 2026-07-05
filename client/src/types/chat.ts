export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export type ChatPhase = 'welcome' | 'conversation'

export type QuickAction = {
  id: string
  label: string
  emoji: string
  prompt: string
}

export type ChatConfig = {
  assistantName: string
  assistantRole: string
  welcomeTitle: string
  welcomeDescription: string
  startButtonLabel: string
  initialMessage: string
  inputPlaceholder: string
  footerText: string
  privacyLabel: string
}
