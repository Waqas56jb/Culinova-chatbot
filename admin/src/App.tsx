import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { AccountPage } from '@/pages/AccountPage'
import { ConversationsPage } from '@/pages/ConversationsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { LoginPage } from '@/pages/LoginPage'
import { LogsPage } from '@/pages/LogsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TrainingPage } from '@/pages/TrainingPage'
import { UsersPage } from '@/pages/UsersPage'
import type { PageId } from '@/types'

const PAGES: Record<PageId, () => React.ReactElement> = {
  dashboard: DashboardPage,
  leads: LeadsPage,
  conversations: ConversationsPage,
  training: TrainingPage,
  settings: SettingsPage,
  users: UsersPage,
  logs: LogsPage,
  account: AccountPage,
}

function Shell() {
  const { profile } = useAuth()
  const [page, setPage] = useState<PageId>('dashboard')

  if (!profile) {
    return <LoginPage />
  }

  const isAdmin = profile.role === 'admin'
  const restricted: PageId[] = ['settings', 'users', 'logs']
  const effectivePage = !isAdmin && restricted.includes(page) ? 'dashboard' : page
  const Current = PAGES[effectivePage]

  return (
    <DataProvider>
      <AdminLayout page={effectivePage} onNavigate={setPage}>
        <Current />
      </AdminLayout>
    </DataProvider>
  )
}

export function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
