import type { AdminUser } from '@/types'

export const serverApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  `${window.location.protocol}//${window.location.hostname}:3000/api`

export type StoredSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  profile: AdminUser
}

const STORAGE_KEY = 'culinova-admin-session'

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function storeSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  profile: AdminUser
}

export function toStoredSession(data: LoginResponse): StoredSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Math.max(data.expiresIn - 60, 60) * 1000,
    profile: data.profile,
  }
}

let refreshing: Promise<StoredSession | null> | null = null

async function refreshSession(): Promise<StoredSession | null> {
  const current = getStoredSession()
  if (!current?.refreshToken) return null

  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetch(`${serverApiUrl}/admin/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        })
        if (!response.ok) return null
        const data = (await response.json()) as LoginResponse
        const session = toStoredSession(data)
        storeSession(session)
        return session
      } catch {
        return null
      } finally {
        refreshing = null
      }
    })()
  }

  return refreshing
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/**
 * Authenticated request to the backend admin API.
 * Automatically refreshes the token once on 401; clears the session if that fails.
 */
export async function adminApi<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let session = getStoredSession()
  if (!session) throw new ApiError('Not signed in', 401)

  if (Date.now() >= session.expiresAt) {
    session = (await refreshSession()) ?? session
  }

  const doFetch = (token: string) =>
    fetch(`${serverApiUrl}/admin${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    })

  let response = await doFetch(session.accessToken)

  if (response.status === 401) {
    const renewed = await refreshSession()
    if (!renewed) {
      clearSession()
      window.location.reload()
      throw new ApiError('Session expired', 401)
    }
    response = await doFetch(renewed.accessToken)
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(body?.error ?? `Request failed (${response.status})`, response.status)
  }

  return (await response.json()) as T
}
