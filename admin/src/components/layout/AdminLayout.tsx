import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { PageId } from '@/types'

type NavItem = {
  id: PageId
  label: string
  icon: ReactNode
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { id: 'leads', label: 'Leads', icon: <Users size={17} /> },
  { id: 'conversations', label: 'Conversations', icon: <MessagesSquare size={17} /> },
  { id: 'training', label: 'Training', icon: <GraduationCap size={17} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={17} />, adminOnly: true },
  { id: 'users', label: 'Team', icon: <ShieldCheck size={17} />, adminOnly: true },
  { id: 'logs', label: 'Audit Logs', icon: <ScrollText size={17} />, adminOnly: true },
  { id: 'account', label: 'My Account', icon: <UserCircle size={17} /> },
]

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Assistant performance at a glance' },
  leads: { title: 'Leads', subtitle: 'Captured prospects from chat and voice' },
  conversations: { title: 'Conversations', subtitle: 'Full transcripts per visitor' },
  training: { title: 'Training Content', subtitle: 'Knowledge that grounds the assistant' },
  settings: { title: 'Settings', subtitle: 'Assistant, widget, and API configuration' },
  users: { title: 'Team', subtitle: 'Accounts, roles, and access control' },
  logs: { title: 'Audit Logs', subtitle: 'Who did what, and when' },
  account: { title: 'My Account', subtitle: 'Your email and password' },
}

type AdminLayoutProps = {
  page: PageId
  onNavigate: (page: PageId) => void
  children: ReactNode
}

export function AdminLayout({ page, onNavigate, children }: AdminLayoutProps) {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const meta = PAGE_TITLES[page]
  const isAdmin = profile?.role === 'admin'

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  const navigate = (target: PageId) => {
    onNavigate(target)
    setMenuOpen(false)
  }

  return (
    <div className={`admin${collapsed ? ' admin--collapsed' : ''}`}>
      <aside className={`admin-sidebar${menuOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <img src="/logo.png" alt="Culinova" className="admin-sidebar__logo" />
          {!collapsed && <span className="admin-sidebar__brand-tag">Admin</span>}
        </div>

        <nav className="admin-sidebar__nav" aria-label="Main navigation">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-sidebar__link${page === item.id ? ' admin-sidebar__link--active' : ''}`}
              onClick={() => navigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          {!collapsed && (
            <div className="admin-sidebar__user">
              <div className="admin-sidebar__user-avatar">
                {(profile?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="admin-sidebar__user-info">
                <p className="admin-sidebar__user-name">{profile?.fullName}</p>
                <p className="admin-sidebar__user-role">
                  {isAdmin ? 'Administrator' : 'Staff'}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut size={15} />
            {!collapsed && 'Sign out'}
          </button>

          <button
            type="button"
            className="admin-sidebar__collapse"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
            {!collapsed && 'Collapse'}
          </button>
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
            <Menu size={19} />
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
            <button
              type="button"
              className="admin-topbar__avatar"
              onClick={() => navigate('account')}
              title="My account"
            >
              {(profile?.fullName || 'A').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
