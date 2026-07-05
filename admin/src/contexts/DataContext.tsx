import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { adminApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type {
  AdminUser,
  AuditLog,
  Conversation,
  Lead,
  LeadStatus,
  TrainingEntry,
  UserRole,
} from '@/types'

type SettingsData = Record<string, unknown>

type DataFeed = {
  role: UserRole
  leads: Lead[]
  conversations: Conversation[]
  training: TrainingEntry[]
  users: AdminUser[]
  logs: AuditLog[]
  settings: SettingsData
}

type DataState = {
  leads: Lead[]
  conversations: Conversation[]
  training: TrainingEntry[]
  users: AdminUser[]
  logs: AuditLog[]
  settingsData: SettingsData
  refresh: () => Promise<void>
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>
  updateLead: (id: string, fields: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  addTraining: (entry: { title: string; category: string; content: string }) => Promise<void>
  updateTraining: (id: string, fields: Partial<TrainingEntry>) => Promise<void>
  deleteTraining: (id: string) => Promise<void>
  createUser: (input: {
    email: string
    password: string
    fullName: string
    role: UserRole
  }) => Promise<string | null>
  deleteUser: (id: string) => Promise<string | null>
  resetUserPassword: (id: string, password: string) => Promise<string | null>
  changeUserRole: (id: string, role: UserRole) => Promise<string | null>
  saveSettings: (data: SettingsData) => Promise<void>
}

const DataContext = createContext<DataState | null>(null)

const POLL_INTERVAL_MS = 8000

export function DataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

  const [leads, setLeads] = useState<Lead[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [training, setTraining] = useState<TrainingEntry[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [settingsData, setSettingsData] = useState<SettingsData>({})

  const refresh = useCallback(async () => {
    if (!profile) return
    try {
      const feed = await adminApi<DataFeed>('/data')
      setLeads(feed.leads)
      setConversations(feed.conversations)
      setTraining(feed.training)
      setUsers(feed.users)
      setLogs(feed.logs)
      setSettingsData(feed.settings ?? {})
    } catch {
      /* server briefly unreachable; keep current data and retry on next poll */
    }
  }, [profile])

  // Initial load + near-realtime polling
  useEffect(() => {
    if (!profile) return
    refresh()
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [profile, refresh])

  /* ---------- leads ---------- */

  const updateLeadStatus = useCallback(
    async (id: string, status: LeadStatus) => {
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)))
      try {
        await adminApi(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  const updateLead = useCallback(
    async (id: string, fields: Partial<Lead>) => {
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...fields } : lead)))
      const { name, company, phone, email, sector, interest } = fields
      try {
        await adminApi(`/leads/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, company, phone, email, sector, interest }),
        })
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  const deleteLead = useCallback(
    async (id: string) => {
      setLeads((prev) => prev.filter((lead) => lead.id !== id))
      try {
        await adminApi(`/leads/${id}`, { method: 'DELETE' })
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  const deleteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== id))
      try {
        await adminApi(`/conversations/${id}`, { method: 'DELETE' })
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  /* ---------- training ---------- */

  const addTraining = useCallback(
    async (entry: { title: string; category: string; content: string }) => {
      try {
        const { entry: created } = await adminApi<{ entry: TrainingEntry }>('/training', {
          method: 'POST',
          body: JSON.stringify(entry),
        })
        setTraining((prev) => [created, ...prev])
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  const updateTraining = useCallback(
    async (id: string, fields: Partial<TrainingEntry>) => {
      setTraining((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, ...fields, updatedAt: new Date().toISOString().slice(0, 10) }
            : entry,
        ),
      )
      const { title, category, content, status } = fields
      try {
        await adminApi(`/training/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, category, content, status }),
        })
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  const deleteTraining = useCallback(
    async (id: string) => {
      setTraining((prev) => prev.filter((entry) => entry.id !== id))
      try {
        await adminApi(`/training/${id}`, { method: 'DELETE' })
      } finally {
        refresh()
      }
    },
    [refresh],
  )

  /* ---------- users ---------- */

  const createUser = useCallback(
    async (input: { email: string; password: string; fullName: string; role: UserRole }) => {
      try {
        await adminApi('/users', { method: 'POST', body: JSON.stringify(input) })
        await refresh()
        return null
      } catch (error) {
        return error instanceof Error ? error.message : 'User creation failed'
      }
    },
    [refresh],
  )

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await adminApi(`/users/${id}`, { method: 'DELETE' })
        await refresh()
        return null
      } catch (error) {
        return error instanceof Error ? error.message : 'Delete failed'
      }
    },
    [refresh],
  )

  const resetUserPassword = useCallback(
    async (id: string, password: string) => {
      try {
        await adminApi(`/users/${id}/password`, {
          method: 'POST',
          body: JSON.stringify({ password }),
        })
        return null
      } catch (error) {
        return error instanceof Error ? error.message : 'Password reset failed'
      }
    },
    [],
  )

  const changeUserRole = useCallback(
    async (id: string, role: UserRole) => {
      try {
        await adminApi(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
        await refresh()
        return null
      } catch (error) {
        return error instanceof Error ? error.message : 'Role change failed'
      }
    },
    [refresh],
  )

  /* ---------- settings ---------- */

  const saveSettings = useCallback(
    async (data: SettingsData) => {
      setSettingsData(data)
      await adminApi('/settings', { method: 'PUT', body: JSON.stringify({ data }) })
    },
    [],
  )

  const value = useMemo<DataState>(
    () => ({
      leads,
      conversations,
      training,
      users,
      logs,
      settingsData,
      refresh,
      updateLeadStatus,
      updateLead,
      deleteLead,
      deleteConversation,
      addTraining,
      updateTraining,
      deleteTraining,
      createUser,
      deleteUser,
      resetUserPassword,
      changeUserRole,
      saveSettings,
    }),
    [
      leads,
      conversations,
      training,
      users,
      logs,
      settingsData,
      refresh,
      updateLeadStatus,
      updateLead,
      deleteLead,
      deleteConversation,
      addTraining,
      updateTraining,
      deleteTraining,
      createUser,
      deleteUser,
      resetUserPassword,
      changeUserRole,
      saveSettings,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataState {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
