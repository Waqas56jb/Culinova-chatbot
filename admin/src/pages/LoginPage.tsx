import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) return
    setBusy(true)
    setError('')
    const result = await signIn(email.trim(), password)
    if (result) setError(result)
    setBusy(false)
  }

  return (
    <div className="login">
      <div className="login__backdrop" aria-hidden="true" />

      <div className="login__card">
        <img src="/logo.png" alt="Culinova" className="login__logo" />

        <div className="login__badge">
          <ShieldCheck size={13} />
          Admin Access
        </div>

        <h1 className="login__title">Welcome back</h1>
        <p className="login__subtitle">
          Sign in to manage the Culinova assistant. Accounts are created by an administrator.
        </p>

        <form className="login__form" onSubmit={submit}>
          <label className="login__field">
            <Mail size={15} className="login__field-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="login__field">
            <Lock size={15} className="login__field-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login__eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </label>

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__submit" disabled={busy}>
            <LogIn size={15} />
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="login__footer">Culinova Admin · Authorized personnel only</p>
      </div>
    </div>
  )
}
