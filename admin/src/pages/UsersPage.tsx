import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import type { UserRole } from '@/types'

export function UsersPage() {
  const { profile } = useAuth()
  const { users, createUser, deleteUser, resetUserPassword, changeUserRole } = useData()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'staff' as UserRole,
  })
  const [formError, setFormError] = useState('')
  const [formOk, setFormOk] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetTarget, setResetTarget] = useState<string | null>(null)
  const [resetPassword, setResetPasswordValue] = useState('')
  const [rowError, setRowError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setFormError('')
    setFormOk('')
    const error = await createUser(form)
    if (error) {
      setFormError(error)
    } else {
      setFormOk(`Account created for ${form.email}`)
      setForm({ fullName: '', email: '', password: '', role: 'staff' })
    }
    setBusy(false)
  }

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Delete account ${email}? This cannot be undone.`)) return
    const error = await deleteUser(id)
    setRowError(error ?? '')
  }

  const handleReset = async (id: string) => {
    if (resetPassword.length < 8) {
      setRowError('New password must be at least 8 characters')
      return
    }
    const error = await resetUserPassword(id, resetPassword)
    setRowError(error ?? '')
    if (!error) {
      setResetTarget(null)
      setResetPasswordValue('')
    }
  }

  return (
    <div className="users-layout">
      <Card
        className="users-list-card"
        title={`Team accounts (${users.length})`}
        subtitle="Only administrators can see and manage this list"
      >
        {rowError && <p className="form-error">{rowError}</p>}

        <div className="users-list">
          {users.map((user) => (
            <div key={user.id} className="user-row">
              <div className="user-row__avatar">
                {user.fullName.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>

              <div className="user-row__info">
                <p className="user-row__name">
                  {user.fullName}
                  {user.id === profile?.id && <span className="user-row__you"> (you)</span>}
                </p>
                <p className="user-row__email">{user.email}</p>
              </div>

              <Badge tone={user.role === 'admin' ? 'gold' : 'blue'}>
                {user.role === 'admin' ? 'Admin' : 'Staff'}
              </Badge>

              {user.id !== profile?.id && (
                <div className="user-row__actions">
                  <select
                    className="ui-input user-row__role"
                    value={user.role}
                    onChange={(event) => changeUserRole(user.id, event.target.value as UserRole)}
                    aria-label={`Role for ${user.email}`}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    type="button"
                    className="ui-btn"
                    onClick={() => {
                      setResetTarget(resetTarget === user.id ? null : user.id)
                      setResetPasswordValue('')
                    }}
                    title="Reset password"
                  >
                    <KeyRound size={13} />
                  </button>

                  <button
                    type="button"
                    className="ui-btn ui-btn--danger"
                    onClick={() => handleDelete(user.id, user.email)}
                    title="Delete account"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}

              {resetTarget === user.id && (
                <div className="user-row__reset">
                  <input
                    type="text"
                    className="ui-input"
                    placeholder="New password (min 8 chars)"
                    value={resetPassword}
                    onChange={(event) => setResetPasswordValue(event.target.value)}
                  />
                  <button
                    type="button"
                    className="ui-btn ui-btn--primary"
                    onClick={() => handleReset(user.id)}
                  >
                    Set password
                  </button>
                </div>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <p className="table-empty">No accounts yet. Create the first one on the right.</p>
          )}
        </div>
      </Card>

      <Card
        className="users-form-card"
        title="Create account"
        subtitle="Give a teammate access with a role"
      >
        <form className="form-stack" onSubmit={submit}>
          <label className="form-field">
            <span className="form-field__label">Full name</span>
            <input
              type="text"
              className="ui-input"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Email</span>
            <input
              type="email"
              className="ui-input"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Temporary password</span>
            <input
              type="text"
              className="ui-input"
              value={form.password}
              minLength={8}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <span className="form-hint">Minimum 8 characters. Share it securely.</span>
          </label>

          <label className="form-field">
            <span className="form-field__label">Role</span>
            <select
              className="ui-input"
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
              }
            >
              <option value="staff">Staff: leads, conversations, training (read)</option>
              <option value="admin">Admin: full access including users and logs</option>
            </select>
          </label>

          {formError && <p className="form-error">{formError}</p>}
          {formOk && <p className="form-ok">{formOk}</p>}

          <button type="submit" className="ui-btn ui-btn--primary" disabled={busy}>
            <UserPlus size={14} />
            {busy ? 'Creating...' : 'Create account'}
          </button>

          <p className="form-note">
            <ShieldCheck size={12} /> Staff members never see the admin user list, audit logs, or
            settings. All account actions are recorded in the audit log.
          </p>
        </form>
      </Card>
    </div>
  )
}
