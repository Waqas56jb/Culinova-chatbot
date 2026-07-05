import { useState } from 'react'
import { KeyRound, Mail, ShieldCheck, UserCircle } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function AccountPage() {
  const { profile, changeEmail, changePassword } = useAuth()

  const [email, setEmail] = useState(profile?.email ?? '')
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submitEmail = async () => {
    if (!email.trim() || email === profile?.email) return
    const error = await changeEmail(email.trim())
    setEmailMsg(
      error
        ? { ok: false, text: error }
        : { ok: true, text: 'Email updated. You may need to confirm via inbox.' },
    )
  }

  const submitPassword = async () => {
    if (password.length < 8) {
      setPasswordMsg({ ok: false, text: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirm) {
      setPasswordMsg({ ok: false, text: 'Passwords do not match.' })
      return
    }
    const error = await changePassword(password)
    setPasswordMsg(error ? { ok: false, text: error } : { ok: true, text: 'Password changed.' })
    if (!error) {
      setPassword('')
      setConfirm('')
    }
  }

  return (
    <div className="settings-grid">
      <Card title="Profile" subtitle="Your admin panel identity">
        <div className="account-profile">
          <div className="account-profile__avatar">
            <UserCircle size={38} strokeWidth={1.2} />
          </div>
          <div>
            <p className="account-profile__name">{profile?.fullName}</p>
            <p className="account-profile__email">{profile?.email}</p>
            <Badge tone={profile?.role === 'admin' ? 'gold' : 'blue'}>
              {profile?.role === 'admin' ? 'Administrator' : 'Staff'}
            </Badge>
          </div>
        </div>

        <div className="form-stack account-section">
          <label className="form-field">
            <span className="form-field__label">
              <Mail size={11} /> Email address
            </span>
            <input
              type="email"
              className="ui-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {emailMsg && (
            <p className={emailMsg.ok ? 'form-ok' : 'form-error'}>{emailMsg.text}</p>
          )}
          <button
            type="button"
            className="ui-btn ui-btn--primary"
            onClick={submitEmail}
            disabled={email === profile?.email}
          >
            Update email
          </button>
        </div>
      </Card>

      <Card title="Change password" subtitle="Use a strong, unique password">
        <div className="form-stack">
          <label className="form-field">
            <span className="form-field__label">
              <KeyRound size={11} /> New password
            </span>
            <input
              type="password"
              className="ui-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Confirm new password</span>
            <input
              type="password"
              className="ui-input"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          {passwordMsg && (
            <p className={passwordMsg.ok ? 'form-ok' : 'form-error'}>{passwordMsg.text}</p>
          )}

          <button
            type="button"
            className="ui-btn ui-btn--primary"
            onClick={submitPassword}
            disabled={!password}
          >
            Change password
          </button>

          <p className="form-note">
            <ShieldCheck size={12} /> Password changes are recorded in the audit log (without the
            password itself).
          </p>
        </div>
      </Card>
    </div>
  )
}
