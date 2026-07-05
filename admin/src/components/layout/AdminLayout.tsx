import { useState } from 'react'
import type { ReactNode } from 'react'
import type { PageId } from '@/types'

type NavItem = {
  id: PageId
  label: string
  icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" />
      </svg>
    ),
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    id: 'conversations',
    label: 'Conversations',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
      </svg>
    ),
  },
  {
    id: 'training',
    label: 'Training',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
]

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Assistant performance at a glance' },
  leads: { title: 'Leads', subtitle: 'Captured prospects from chat and voice' },
  conversations: { title: 'Conversations', subtitle: 'Full transcripts per visitor' },
  training: { title: 'Training Content', subtitle: 'Knowledge that grounds the assistant' },
  settings: { title: 'Settings', subtitle: 'Assistant, widget, and API configuration' },
}

type AdminLayoutProps = {
  page: PageId
  onNavigate: (page: PageId) => void
  children: ReactNode
}

export function AdminLayout({ page, onNavigate, children }: AdminLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const meta = PAGE_TITLES[page]

  const navigate = (target: PageId) => {
    onNavigate(target)
    setMenuOpen(false)
  }

  return (
    <div className="admin">
      <aside className={`admin-sidebar${menuOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <img src="/logo.png" alt="Culinova" className="admin-sidebar__logo" />
          <span className="admin-sidebar__brand-tag">Admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-sidebar__link${page === item.id ? ' admin-sidebar__link--active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__status">
            <span className="admin-sidebar__status-dot" />
            Assistant online
          </div>
          <p className="admin-sidebar__version">Culinova Admin v1.0</p>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="admin-scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <div className="admin-topbar__titles">
            <h1 className="admin-topbar__title">{meta.title}</h1>
            <p className="admin-topbar__subtitle">{meta.subtitle}</p>
          </div>

          <div className="admin-topbar__right">
            <span className="admin-topbar__badge">
              <span className="admin-topbar__badge-dot" />
              Live
            </span>
            <div className="admin-topbar__avatar" aria-hidden="true">
              C
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
