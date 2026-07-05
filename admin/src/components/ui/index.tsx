import type { ReactNode } from 'react'

/* Card */
type CardProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, actions, children, className = '' }: CardProps) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {(title || actions) && (
        <header className="ui-card__head">
          <div>
            {title && <h2 className="ui-card__title">{title}</h2>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

/* Stat card */
type StatCardProps = {
  label: string
  value: string
  delta: string
  deltaUp: boolean
  icon: ReactNode
}

export function StatCard({ label, value, delta, deltaUp, icon }: StatCardProps) {
  return (
    <div className="ui-stat">
      <div className="ui-stat__icon">{icon}</div>
      <div className="ui-stat__body">
        <p className="ui-stat__label">{label}</p>
        <p className="ui-stat__value">{value}</p>
        <p className={`ui-stat__delta ${deltaUp ? 'ui-stat__delta--up' : 'ui-stat__delta--down'}`}>
          {deltaUp ? '▲' : '▼'} {delta}
        </p>
      </div>
    </div>
  )
}

/* Badge */
type BadgeTone = 'gold' | 'green' | 'blue' | 'red' | 'gray'

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>
}

/* Toggle */
type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="ui-toggle-row">
      <div>
        <p className="ui-toggle-row__label">{label}</p>
        {description && <p className="ui-toggle-row__desc">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`ui-toggle${checked ? ' ui-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ui-toggle__thumb" />
      </button>
    </div>
  )
}
