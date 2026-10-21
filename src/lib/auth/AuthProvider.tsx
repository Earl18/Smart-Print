'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PublicUser, Role } from '@/lib/data/types'

interface AuthState {
  user: PublicUser | null
  /** True until the first session check completes. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const CACHE_KEY = 'sp.auth.user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' })
      const data = (await res.json()) as { user: PublicUser | null }
      setUser(data.user)
      if (data.user) localStorage.setItem(CACHE_KEY, JSON.stringify(data.user))
      else localStorage.removeItem(CACHE_KEY)
    } catch {
      /* network hiccup — keep the cached user, retry on next mount */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Instant paint from the cached profile, then confirm with the server.
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) setUser(JSON.parse(cached) as PublicUser)
    } catch {
      /* ignore malformed cache */
    }
    void refresh()
  }, [refresh])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as { ok: boolean; user?: PublicUser; error?: string }
      if (data.ok && data.user) {
        setUser(data.user)
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.user))
        return { ok: true }
      }
      return { ok: false, error: data.error ?? 'Sign-in failed. Check your email and password.' }
    },
    [],
  )

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* the cookie is cleared client-side regardless */
    }
    setUser(null)
    localStorage.removeItem(CACHE_KEY)
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
