import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { useData } from '@/contexts/DataContext'

const ACTION_TONES: Record<string, 'gold' | 'green' | 'blue' | 'red' | 'gray'> = {
  'auth.signed_in': 'green',
  'auth.signed_out': 'gray',
  'user.created': 'gold',
  'user.deleted': 'red',
  'user.password_reset': 'blue',
  'user.role_changed': 'gold',
  'lead.deleted': 'red',
  'lead.updated': 'blue',
  'lead.status_changed': 'blue',
  'conversation.deleted': 'red',
  'training.created': 'gold',
  'training.updated': 'blue',
  'training.deleted': 'red',
  'settings.saved': 'gold',
  'account.email_changed': 'blue',
  'account.password_changed': 'blue',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LogsPage() {
  const { logs } = useData()
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const actionTypes = useMemo(
    () => ['all', ...Array.from(new Set(logs.map((log) => log.action.split('.')[0])))],
    [logs],
  )

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return logs.filter((log) => {
      if (actionFilter !== 'all' && !log.action.startsWith(actionFilter)) return false
      if (!text) return true
      return `${log.actorEmail} ${log.action} ${log.target}`.toLowerCase().includes(text)
    })
  }, [logs, query, actionFilter])

  return (
    <div className="page-grid">
      <Card
        title={`Audit trail (${filtered.length})`}
        subtitle="Every action in the admin panel, visible to admins only"
        actions={<Badge tone="gold">Admins only</Badge>}
      >
        <div className="filter-bar">
          <input
            type="search"
            className="ui-input filter-bar__search"
            placeholder="Search by user, action, or target..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search logs"
          />
          <div className="filter-bar__group">
            {actionTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`ui-chip${actionFilter === type ? ' ui-chip--active' : ''}`}
                onClick={() => setActionFilter(type)}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>

        <div className="log-list">
          {filtered.map((log) => (
            <div key={log.id} className="log-row">
              <div className="log-row__icon">
                <ScrollText size={14} />
              </div>
              <div className="log-row__body">
                <p className="log-row__line">
                  <strong>{log.actorEmail}</strong>
                  <Badge tone={ACTION_TONES[log.action] ?? 'gray'}>{log.action}</Badge>
                  {log.target && <span className="log-row__target">{log.target}</span>}
                </p>
                {log.detail && log.detail !== '{}' && (
                  <code className="log-row__detail">{log.detail}</code>
                )}
              </div>
              <span className="log-row__time">{formatTime(log.createdAt)}</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="table-empty">No audit entries match the current filters.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
