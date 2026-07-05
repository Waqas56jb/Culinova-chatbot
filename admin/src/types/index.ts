export type PageId =
  | 'dashboard'
  | 'leads'
  | 'conversations'
  | 'training'
  | 'settings'
  | 'users'
  | 'logs'
  | 'account'

export type UserRole = 'admin' | 'staff'

export type AdminUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}

export type AuditLog = {
  id: number
  actorEmail: string
  action: string
  target: string
  detail: string
  createdAt: string
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed'
export type LeadSource = 'chat' | 'voice'

export type Lead = {
  id: string
  name: string
  company: string
  phone: string
  email: string
  sector: string
  interest: string
  source: LeadSource
  status: LeadStatus
  createdAt: string
}

export type TranscriptMessage = {
  role: 'user' | 'assistant'
  content: string
  time?: string
}

export type Conversation = {
  id: string
  visitor: string
  channel: LeadSource
  language: string
  startedAt: string
  durationMin: number
  messagesCount: number
  leadCaptured: boolean
  satisfaction: number
  transcript: TranscriptMessage[]
}

export type TrainingEntry = {
  id: string
  title: string
  category: string
  content: string
  status: 'published' | 'draft'
  updatedAt: string
}

export type WidgetTemplate = {
  id: string
  name: string
  description: string
  primary: string
  accent: string
  surface: string
  text: string
}

export type OrbTheme = {
  id: string
  name: string
  core: string
  glow: string
}

export type DailyPoint = {
  date: string
  conversations: number
  leads: number
  voiceSessions: number
}
