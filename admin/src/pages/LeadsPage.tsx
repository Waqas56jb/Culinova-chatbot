import { useMemo, useState } from 'react'
import { Download, Pencil, Save, Trash2, X } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import type { Lead, LeadStatus } from '@/types'

const STATUS_TONE: Record<LeadStatus, 'gold' | 'green' | 'blue' | 'gray'> = {
  new: 'gold',
  contacted: 'blue',
  qualified: 'green',
  closed: 'gray',
}

const STATUS_OPTIONS: Array<'all' | LeadStatus> = ['all', 'new', 'contacted', 'qualified', 'closed']

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function exportCsv(leads: Lead[]) {
  const header = 'Name,Company,Phone,Email,Sector,Interest,Source,Status,Captured'
  const rows = leads.map((lead) =>
    [lead.name, lead.company, lead.phone, lead.email, lead.sector, lead.interest, lead.source, lead.status, lead.createdAt]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `culinova-leads-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

type EditState = {
  id: string
  name: string
  company: string
  phone: string
  email: string
  sector: string
  interest: string
}

export function LeadsPage() {
  const { profile } = useAuth()
  const { leads, updateLeadStatus, updateLead, deleteLead } = useData()
  const isAdmin = profile?.role === 'admin'

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'chat' | 'voice'>('all')
  const [editing, setEditing] = useState<EditState | null>(null)

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false
      if (!text) return true
      return [lead.name, lead.company, lead.email, lead.phone, lead.sector, lead.interest]
        .join(' ')
        .toLowerCase()
        .includes(text)
    })
  }, [leads, query, statusFilter, sourceFilter])

  const startEdit = (lead: Lead) => {
    setEditing({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      sector: lead.sector,
      interest: lead.interest,
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    const { id, ...fields } = editing
    await updateLead(id, fields)
    setEditing(null)
  }

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return
    await deleteLead(lead.id)
  }

  return (
    <div className="page-grid">
      <Card
        title={`All leads (${filtered.length})`}
        subtitle="Live leads captured by the assistant, updated in real time"
        actions={
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => exportCsv(filtered)}>
            <Download size={13} /> Export CSV
          </button>
        }
      >
        <div className="filter-bar">
          <input
            type="search"
            className="ui-input filter-bar__search"
            placeholder="Search name, company, email, phone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search leads"
          />

          <div className="filter-bar__group" role="group" aria-label="Filter by status">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                className={`ui-chip${statusFilter === status ? ' ui-chip--active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <select
            className="ui-input filter-bar__select"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as typeof sourceFilter)}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>
            <option value="chat">Chat</option>
            <option value="voice">Voice</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact</th>
                <th>Sector</th>
                <th>Interest</th>
                <th>Source</th>
                <th>Captured</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <p className="lead-table__name">{lead.name || '—'}</p>
                    <p className="lead-table__sub">{lead.company}</p>
                  </td>
                  <td>
                    <p className="lead-table__contact">{lead.phone || '—'}</p>
                    <p className="lead-table__sub">{lead.email}</p>
                  </td>
                  <td>{lead.sector || '—'}</td>
                  <td className="lead-table__interest">{lead.interest}</td>
                  <td>
                    <Badge tone={lead.source === 'voice' ? 'gold' : 'blue'}>
                      {lead.source === 'voice' ? 'Voice' : 'Chat'}
                    </Badge>
                  </td>
                  <td className="lead-table__date">{formatDate(lead.createdAt)}</td>
                  <td>
                    <select
                      className={`lead-status lead-status--${lead.status}`}
                      value={lead.status}
                      onChange={(event) =>
                        updateLeadStatus(lead.id, event.target.value as LeadStatus)
                      }
                      aria-label={`Status for ${lead.name}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <div className="lead-table__actions">
                      <button
                        type="button"
                        className="ui-btn"
                        onClick={() => startEdit(lead)}
                        title="Edit lead"
                      >
                        <Pencil size={13} />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="ui-btn ui-btn--danger"
                          onClick={() => handleDelete(lead)}
                          title="Delete lead"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="table-empty">No leads match the current filters.</p>
          )}
        </div>
      </Card>

      {editing && (
        <Card
          title="Edit lead"
          subtitle={`Updating ${editing.name || editing.email || editing.id}`}
          actions={
            <button type="button" className="ui-btn" onClick={() => setEditing(null)}>
              <X size={13} /> Cancel
            </button>
          }
        >
          <div className="edit-grid">
            {(
              [
                ['name', 'Name'],
                ['company', 'Company'],
                ['phone', 'Phone'],
                ['email', 'Email'],
                ['sector', 'Sector'],
                ['interest', 'Interest'],
              ] as Array<[keyof Omit<EditState, 'id'>, string]>
            ).map(([key, label]) => (
              <label key={key} className="form-field">
                <span className="form-field__label">{label}</span>
                <input
                  type="text"
                  className="ui-input"
                  value={editing[key]}
                  onChange={(event) =>
                    setEditing((prev) => (prev ? { ...prev, [key]: event.target.value } : prev))
                  }
                />
              </label>
            ))}
          </div>
          <button type="button" className="ui-btn ui-btn--primary" onClick={saveEdit}>
            <Save size={13} /> Save changes
          </button>
        </Card>
      )}

      <div className="stat-grid stat-grid--compact">
        {STATUS_OPTIONS.filter((status) => status !== 'all').map((status) => {
          const count = leads.filter((lead) => lead.status === status).length
          return (
            <Card key={status} className="ui-card--tight">
              <div className="status-summary">
                <Badge tone={STATUS_TONE[status as LeadStatus]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <p className="status-summary__count">{count}</p>
                <p className="status-summary__label">leads</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
