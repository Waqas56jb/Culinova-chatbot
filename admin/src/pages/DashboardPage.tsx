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
import { Badge, Card, StatCard } from '@/components/ui'
import {
  CHANNEL_SPLIT,
  DAILY_SERIES,
  HOURLY_ACTIVITY,
  LANGUAGE_SPLIT,
  LEADS,
  TOP_INTENTS,
} from '@/data/mock'

const GOLD = '#d4af37'
const BLACK = '#1a1a1a'
const PIE_COLORS = [BLACK, GOLD, '#8a7a45', '#c9c2ae']
const LANG_COLORS = [GOLD, BLACK, '#8a7a45', '#c9c2ae']

const totals = DAILY_SERIES.reduce(
  (acc, day) => ({
    conversations: acc.conversations + day.conversations,
    leads: acc.leads + day.leads,
    voice: acc.voice + day.voiceSessions,
  }),
  { conversations: 0, leads: 0, voice: 0 },
)

const conversionRate = Math.round((totals.leads / totals.conversations) * 100)
const last14 = DAILY_SERIES.slice(-14)

export function DashboardPage() {
  return (
    <div className="page-grid">
      <div className="stat-grid">
        <StatCard
          label="Conversations (30d)"
          value={totals.conversations.toLocaleString()}
          delta="12.4% vs prev period"
          deltaUp
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          }
        />
        <StatCard
          label="Leads captured"
          value={totals.leads.toLocaleString()}
          delta="8.9% vs prev period"
          deltaUp
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          }
        />
        <StatCard
          label="Voice sessions"
          value={totals.voice.toLocaleString()}
          delta="21.7% vs prev period"
          deltaUp
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20H8c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-3v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
          }
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate}%`}
          delta="1.2% vs prev period"
          deltaUp={false}
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
            </svg>
          }
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
              <AreaChart data={DAILY_SERIES} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
                  data={CHANNEL_SPLIT}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={3}
                >
                  {CHANNEL_SPLIT.map((entry, index) => (
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
              <LineChart data={HOURLY_ACTIVITY} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
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
                <Pie data={LANGUAGE_SPLIT} dataKey="value" nameKey="name" outerRadius="80%">
                  {LANGUAGE_SPLIT.map((entry, index) => (
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
        <Card title="Top intents" subtitle="What visitors ask about most">
          <ul className="intent-list">
            {TOP_INTENTS.map((intent) => (
              <li key={intent.name} className="intent-list__row">
                <span className="intent-list__name">{intent.name}</span>
                <div className="intent-list__track">
                  <div
                    className="intent-list__fill"
                    style={{ width: `${(intent.value / TOP_INTENTS[0].value) * 100}%` }}
                  />
                </div>
                <span className="intent-list__value">{intent.value}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Latest leads" subtitle="Most recent captures" actions={<Badge tone="green">Live</Badge>}>
          <div className="mini-table">
            {LEADS.slice(0, 5).map((lead) => (
              <div key={lead.id} className="mini-table__row">
                <div className="mini-table__main">
                  <p className="mini-table__name">{lead.name}</p>
                  <p className="mini-table__meta">
                    {lead.company} · {lead.sector}
                  </p>
                </div>
                <Badge tone={lead.source === 'voice' ? 'gold' : 'blue'}>
                  {lead.source === 'voice' ? 'Voice' : 'Chat'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
