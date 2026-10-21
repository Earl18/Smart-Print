'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, TriangleAlert } from 'lucide-react'
import { homeForRole, useAuth } from '@/lib/auth/AuthProvider'
import { StickerCard, StatusPill } from '@/components/site/primitives'

function LoginForm() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = params.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in? Go straight to the right dashboard.
  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath && nextPath.startsWith('/') ? nextPath : homeForRole(user.role))
    }
  }, [loading, user, router, nextPath])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    setSubmitting(true)
    const res = await signIn(email, password)
    setSubmitting(false)
    if (!res.ok || !res.user) {
      setError(res.error ?? 'Sign-in failed. Check your email and password.')
      return
    }
    // Redirect by account role (or the page that sent us here).
    router.replace(nextPath && nextPath.startsWith('/') ? nextPath : homeForRole(res.user.role))
  }

  return (
    <StickerCard className="w-full max-w-md p-6 sm:p-8" as="section">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Sign in</h1>
      <p className="mt-1.5 text-sm font-semibold text-black/60">
        For kiosk operators and Smart Print administrators.
      </p>

      {error ? (
        <div role="alert" className="mt-5">
          <StatusPill tone="error" icon={TriangleAlert}>
            {error}
          </StatusPill>
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block font-display text-sm font-bold">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-black/45" strokeWidth={2.5} aria-hidden />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@smartprint.example"
              className="kb-input min-h-14 pl-11! font-semibold"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block font-display text-sm font-bold">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-black/45" strokeWidth={2.5} aria-hidden />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="kb-input min-h-14 pl-11! pr-14! font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-kpaper"
            >
              {showPassword ? (
                <EyeOff className="size-5" strokeWidth={2.5} aria-hidden />
              ) : (
                <Eye className="size-5" strokeWidth={2.5} aria-hidden />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="kb-btn kb-btn-lime mt-1 w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="font-display text-sm font-bold underline decoration-[3px] underline-offset-4 hover:bg-klime"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </StickerCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
