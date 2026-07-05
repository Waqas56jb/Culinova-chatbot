import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Mic, MessagesSquare, TrendingUp, Users } from 'lucide-react'
import { Badge, Card, StatCard } from '@/components/ui'
import { useData } from '@/contexts/DataContext'
import type { Conversation, DailyPoint, Lead } from '@/types'

const GOLD = '#d4af37'
const BLACK = '#1a1a1a'
const PIE_COLORS = [BLACK, GOLD, '#8a7a45', '#c9c2ae']
const LANG_COLORS = [GOLD, BLACK, '#8a7a45', '#c9c2ae']

function buildDailySeries(leads: Lead[], conversations: Conversation[]): DailyPoint[] {
  const days: DailyPoint[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    const label = day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

    const dayConvs = conversations.filter((conv) => conv.startedAt.slice(0, 10) === key)
    days.push({
      date: label,
      conversations: dayConvs.length,
      leads: leads.filter((lead) => lead.createdAt.slice(0, 10) === key).length,
      voiceSessions: dayConvs.filter((conv) => conv.channel === 'voice').length,
    })
  }
  return days
}

function buildSplit(conversations: Conversation[], key: 'channel' | 'language') {
  const counts = new Map<string, number>()
  for (const conv of conversations) {
    const value = key === 'channel' ? (conv.channel === 'voice' ? 'Voice' : 'Chat') : conv.language
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
}

function buildHourly(conversations: Conversation[]) {
  const hours = Array.from({ length: 12 }, (_, index) => ({
    hour: `${String(index * 2).padStart(2, '0')}:00`,
    sessions: 0,
  }))
  for (const conv of conversations) {
    const hour = new Date(conv.startedAt).getHours()
    hours[Math.floor(hour / 2)].sessions += 1
  }
  return hours
}

function buildTopSectors(leads: Lead[]) {
  const counts = new Map<string, number>()
  for (const lead of leads) {
    const sector = lead.sector || 'Other'
    counts.set(sector, (counts.get(sector) ?? 0) + 1)
  }
  const total = Math.max(leads.length, 1)
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}

export function DashboardPage() {
  const { leads, conversations } = useData()

  const dailySeries = useMemo(
    () => buildDailySeries(leads, conversations),
    [leads, conversations],
  )
  const channelSplit = useMemo(() => buildSplit(conversations, 'channel'), [conversations])
  const languageSplit = useMemo(() => buildSplit(conversations, 'language'), [conversations])
  const hourlyActivity = useMemo(() => buildHourly(conversations), [conversations])
  const topIntents = useMemo(() => buildTopSectors(leads), [leads])

  const totals = useMemo(
    () =>
      dailySeries.reduce(
        (acc, day) => ({
          conversations: acc.conversations + day.conversations,
          leads: acc.leads + day.leads,
          voice: acc.voice + day.voiceSessions,
        }),
        { conversations: 0, leads: 0, voice: 0 },
      ),
    [dailySeries],
  )

  const conversionRate =
    totals.conversations > 0 ? Math.round((totals.leads / totals.conversations) * 100) : 0
  const last14 = dailySeries.slice(-14)

  return (
    <div className="page-grid">
      {conversations.length === 0 && leads.length === 0 && (
        <Card>
          <p className="demo-note">
            Connected to Supabase. Analytics will fill in automatically as visitors chat with the
            assistant.
          </p>
        </Card>
      )}

      <div className="stat-grid">
        <StatCard
          label="Conversations (30d)"
          value={totals.conversations.toLocaleString()}
          delta="live"
          deltaUp
          icon={<MessagesSquare size={20} strokeWidth={1.8} />}
        />
        <StatCard
          label="Leads captured"
          value={leads.length.toLocaleString()}
          delta="live"
          deltaUp
          icon={<Users size={20} strokeWidth={1.8} />}
        />
        <StatCard
          label="Voice sessions"
          value={totals.voice.toLocaleString()}
          delta="live"
          deltaUp
          icon={<Mic size={20} strokeWidth={1.8} />}
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate}%`}
          delta="live"
          deltaUp
          icon={<TrendingUp size={20} strokeWidth={1.8} />}
        />
      </div>

      <div className="chart-grid chart-grid--main">
        <Card
          title="Conversations & voice sessions"
          subtitle="Daily volume, last 30 days"
          actions={<Badge tone="gold">30 days</Badge>}
        >
          <div className="chart-box chart-box--tall">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BLACK} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BLACK} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradVoice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  name="Conversations"
                  stroke={BLACK}
                  fill="url(#gradConv)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="voiceSessions"
                  name="Voice sessions"
                  stroke={GOLD}
                  fill="url(#gradVoice)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Channel split" subtitle="Text vs voice share">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={3}
                >
                  {channelSplit.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="chart-grid chart-grid--three">
        <Card title="Daily leads" subtitle="Last 14 days">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="leads" name="Leads" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Peak hours" subtitle="Sessions by time of day">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyActivity} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Sessions"
                  stroke={BLACK}
                  strokeWidth={2}
                  dot={{ r: 2, fill: GOLD, stroke: GOLD }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Languages" subtitle="Visitor language share">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={languageSplit} dataKey="value" nameKey="name" outerRadius="80%">
                  {languageSplit.map((entry, index) => (
                    <Cell key={entry.name} fill={LANG_COLORS[index % LANG_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="chart-grid chart-grid--split">
        <Card title="Top sectors" subtitle="Where leads come from">
          <ul className="intent-list">
            {topIntents.map((intent) => (
              <li key={intent.name} className="intent-list__row">
                <span className="intent-list__name">{intent.name}</span>
                <div className="intent-list__track">
                  <div
                    className="intent-list__fill"
                    style={{ width: `${(intent.value / (topIntents[0]?.value || 1)) * 100}%` }}
                  />
                </div>
                <span className="intent-list__value">{intent.value}%</span>
              </li>
            ))}
            {topIntents.length === 0 && <p className="table-empty">No lead data yet.</p>}
          </ul>
        </Card>

        <Card
          title="Latest leads"
          subtitle="Most recent captures"
          actions={<Badge tone="green">Live</Badge>}
        >
          <div className="mini-table">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="mini-table__row">
                <div className="mini-table__main">
                  <p className="mini-table__name">{lead.name || lead.email || 'Visitor'}</p>
                  <p className="mini-table__meta">
                    {[lead.company, lead.sector].filter(Boolean).join(' · ') || lead.interest}
                  </p>
                </div>
                <Badge tone={lead.source === 'voice' ? 'gold' : 'blue'}>
                  {lead.source === 'voice' ? 'Voice' : 'Chat'}
                </Badge>
              </div>
            ))}
            {leads.length === 0 && <p className="table-empty">No leads captured yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
