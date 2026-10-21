'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PublicUser, Role } from '@/lib/data/types'

interface AuthState {
  user: PublicUser | null
  /** True until the first session check completes. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; user?: PublicUser; error?: string }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const CACHE_KEY = 'sp.auth.user'
const TOKEN_KEY = 'sp.auth.token'

/**
 * Session id storage. Cookies are the primary transport, but embedded
 * previews (cross-site iframes) silently drop SameSite cookies — there we
 * keep the same session id in localStorage and send it as x-session-token.
 * localStorage itself can be blocked in third-party contexts, hence the
 * try/catch wrappers (auth then just falls back to the cookie).
 */
const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(value: string) {
    try {
      localStorage.setItem(TOKEN_KEY, value)
    } catch {
      /* storage blocked — cookie path only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

function readCachedUser(): PublicUser | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? (JSON.parse(cached) as PublicUser) : null
  } catch {
    return null
  }
}

function cacheUser(user: PublicUser | null) {
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user))
    else localStorage.removeItem(CACHE_KEY)
  } catch {
    /* storage blocked */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const token = tokenStore.get()
      const res = await fetch('/api/auth/session', {
        cache: 'no-store',
        headers: token ? { 'x-session-token': token } : undefined,
      })
      const data = (await res.json()) as { user: PublicUser | null }
      setUser(data.user)
      cacheUser(data.user)
      if (!data.user) tokenStore.clear()
    } catch {
      /* network hiccup — keep the cached user, retry on next mount */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Instant paint from the cached profile, then confirm with the server.
    setUser(readCachedUser())
    void refresh()
  }, [refresh])

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = (await res.json()) as {
      ok: boolean
      user?: PublicUser
      token?: string
      error?: string
    }
    if (data.ok && data.user) {
      setUser(data.user)
      cacheUser(data.user)
      if (data.token) tokenStore.set(data.token)
      return { ok: true, user: data.user }
    }
    return { ok: false, error: data.error ?? 'Sign-in failed. Check your email and password.' }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* the cookie is cleared client-side regardless */
    }
    setUser(null)
    cacheUser(null)
    tokenStore.clear()
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user, loading, signIn, signOut, refresh }),
    [user, loading, signIn, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function homeForRole(role: Role): string {
  return role === 'admin' ? '/admin' : '/operator'
}
