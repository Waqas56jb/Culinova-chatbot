import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ConversationsPage() {
  const { profile } = useAuth()
  const { conversations, deleteConversation } = useData()
  const isAdmin = profile?.role === 'admin'

  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | 'chat' | 'voice'>('all')

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return conversations.filter((conv) => {
      if (channelFilter !== 'all' && conv.channel !== channelFilter) return false
      if (!text) return true
      return (
        conv.visitor.toLowerCase().includes(text) ||
        conv.language.toLowerCase().includes(text) ||
        conv.transcript.some((m) => m.content.toLowerCase().includes(text))
      )
    })
  }, [conversations, query, channelFilter])

  const selected =
    filtered.find((conv) => conv.id === selectedId) ?? filtered[0] ?? null

  return (
    <div className="conv-layout">
      <Card className="conv-list-card" title={`Sessions (${filtered.length})`}>
        <div className="conv-filters">
          <input
            type="search"
            className="ui-input"
            placeholder="Search visitor or message..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search conversations"
          />
          <div className="filter-bar__group" role="group" aria-label="Filter by channel">
            {(['all', 'chat', 'voice'] as const).map((channel) => (
              <button
                key={channel}
                type="button"
                className={`ui-chip${channelFilter === channel ? ' ui-chip--active' : ''}`}
                onClick={() => setChannelFilter(channel)}
              >
                {channel === 'all' ? 'All' : channel === 'chat' ? 'Chat' : 'Voice'}
              </button>
            ))}
          </div>
        </div>

        <div className="conv-list">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={`conv-item${selected?.id === conv.id ? ' conv-item--active' : ''}`}
              onClick={() => setSelectedId(conv.id)}
            >
              <div className="conv-item__top">
                <span className="conv-item__visitor">{conv.visitor}</span>
                <Badge tone={conv.channel === 'voice' ? 'gold' : 'blue'}>
                  {conv.channel === 'voice' ? 'Voice' : 'Chat'}
                </Badge>
              </div>
              <p className="conv-item__preview">
                {conv.transcript.find((m) => m.role === 'user')?.content ?? ''}
              </p>
              <div className="conv-item__meta">
                <span>{formatDate(conv.startedAt)}</span>
                <span>{conv.durationMin} min</span>
                <span>{conv.language}</span>
                {conv.leadCaptured && <Badge tone="green">Lead</Badge>}
              </div>
            </button>
          ))}

          {filtered.length === 0 && <p className="table-empty">No sessions found.</p>}
        </div>
      </Card>

      <Card
        className="conv-detail-card"
        title={selected ? selected.visitor : 'Transcript'}
        subtitle={
          selected
            ? `${formatDate(selected.startedAt)} · ${selected.durationMin} min · ${selected.language} · ${selected.messagesCount} messages`
            : 'Select a session to view its transcript'
        }
        actions={
          selected && (
            <div className="conv-detail__badges">
              <Badge tone={selected.channel === 'voice' ? 'gold' : 'blue'}>
                {selected.channel === 'voice' ? 'Voice session' : 'Text chat'}
              </Badge>
              {selected.leadCaptured && <Badge tone="green">Lead captured</Badge>}
              {isAdmin && (
                <button
                  type="button"
                  className="ui-btn ui-btn--danger"
                  title="Delete conversation"
                  onClick={() => {
                    if (window.confirm('Delete this conversation transcript?')) {
                      deleteConversation(selected.id)
                      setSelectedId('')
                    }
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )
        }
      >
        {selected ? (
          <div className="transcript">
            {selected.transcript.map((message, index) => (
              <div
                key={`${selected.id}-${index}`}
                className={`transcript__msg transcript__msg--${message.role}`}
              >
                <div className="transcript__bubble">
                  <p className="transcript__text">{message.content}</p>
                  <span className="transcript__time">{message.time}</span>
                </div>
              </div>
            ))}

            {selected.satisfaction > 0 && (
              <div className="transcript__rating">
                Visitor satisfaction:{' '}
                <span className="transcript__stars">
                  {'★'.repeat(selected.satisfaction)}
                  {'☆'.repeat(5 - selected.satisfaction)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="table-empty">No session selected.</p>
        )}
      </Card>
    </div>
  )
}
