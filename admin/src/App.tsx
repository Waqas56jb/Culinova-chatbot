import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { ConversationsPage } from '@/pages/ConversationsPage'
import { TrainingPage } from '@/pages/TrainingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import type { PageId } from '@/types'

const PAGES: Record<PageId, () => React.ReactElement> = {
  dashboard: DashboardPage,
  leads: LeadsPage,
  conversations: ConversationsPage,
  training: TrainingPage,
  settings: SettingsPage,
}

export function App() {
  const [page, setPage] = useState<PageId>('dashboard')
  const Current = PAGES[page]

  return (
    <AdminLayout page={page} onNavigate={setPage}>
      <Current />
    </AdminLayout>
  )
}
