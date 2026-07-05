import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  adminApi,
  clearSession,
  getStoredSession,
  serverApiUrl,
  storeSession,
  toStoredSession,
} from '@/lib/api'
import type { AdminUser } from '@/types'

type AuthState = {
  profile: AdminUser | null
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  changeEmail: (email: string) => Promise<string | null>
  changePassword: (password: string) => Promise<string | null>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminUser | null>(
    () => getStoredSession()?.profile ?? null,
  )

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const response = await fetch(`${serverApiUrl}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        return (data as { error?: string } | null)?.error ?? 'Sign-in failed'
      }
      const session = toStoredSession(data)
      storeSession(session)
      setProfile(session.profile)
      return null
    } catch {
      return 'Could not reach the server. Make sure the backend is running.'
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await adminApi('/auth/logout', { method: 'POST' })
    } catch {
      /* clear locally regardless */
    }
    clearSession()
    setProfile(null)
  }, [])

  const changeEmail = useCallback(async (email: string): Promise<string | null> => {
    try {
      await adminApi('/account/email', { method: 'POST', body: JSON.stringify({ email }) })
      const session = getStoredSession()
      if (session) {
        const updated = { ...session, profile: { ...session.profile, email } }
        storeSession(updated)
        setProfile(updated.profile)
      }
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Email change failed'
    }
  }, [])

  const changePassword = useCallback(async (password: string): Promise<string | null> => {
    try {
      await adminApi('/account/password', { method: 'POST', body: JSON.stringify({ password }) })
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Password change failed'
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({ profile, signIn, signOut, changeEmail, changePassword }),
    [profile, signIn, signOut, changeEmail, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
