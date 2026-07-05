import { useMemo, useState } from 'react'
import { Badge, Card } from '@/components/ui'
import { LEADS } from '@/data/mock'
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

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(LEADS)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'chat' | 'voice'>('all')

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

  const updateStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)))
  }

  return (
    <div className="page-grid">
      <Card
        title={`All leads (${filtered.length})`}
        subtitle="Search, filter, and update lead status"
        actions={
          <button type="button" className="ui-btn ui-btn--primary">
            Export CSV
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <p className="lead-table__name">{lead.name}</p>
                    <p className="lead-table__sub">{lead.company}</p>
                  </td>
                  <td>
                    <p className="lead-table__contact">{lead.phone}</p>
                    <p className="lead-table__sub">{lead.email}</p>
                  </td>
                  <td>{lead.sector}</td>
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
                      onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)}
                      aria-label={`Status for ${lead.name}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
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
