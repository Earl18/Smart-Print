'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, TriangleAlert } from 'lucide-react'
import { Suspense } from 'react'
import { StickerCard, StatusPill } from '@/components/site/primitives'

function ResetForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!data.ok) setError(data.error ?? 'The reset link is invalid. Request a new one.')
      else setDone(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StickerCard className="w-full max-w-md p-6 sm:p-8" as="section">
      {done ? (
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full border-[3px] border-black bg-klime shadow-[4px_4px_0_#000]">
            <CheckCircle2 className="size-8" strokeWidth={2.5} aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Password updated</h1>
          <p className="mt-2 text-sm font-semibold text-black/60">
            Your password has been changed. You can sign in with it now.
          </p>
          <Link href="/login" className="kb-btn kb-btn-lime mt-6 w-full">
            Go to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Choose a new password</h1>
          <p className="mt-1.5 text-sm font-semibold text-black/60">
            Pick a new password for your Smart Print account.
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
              <label htmlFor="reset-password" className="mb-1.5 block font-display text-sm font-bold">
                New password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-black/45" strokeWidth={2.5} aria-hidden />
                <input
                  id="reset-password"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="kb-input min-h-14 pl-11! pr-14! font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-kpaper"
                >
                  {show ? (
                    <EyeOff className="size-5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <Eye className="size-5" strokeWidth={2.5} aria-hidden />
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="kb-btn kb-btn-lime mt-1 w-full">
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
                  Saving…
                </>
              ) : (
                'Update password'
              )}
            </button>
            <Link
              href="/login"
              className="mx-auto flex min-h-11 items-center font-display text-sm font-bold underline decoration-[3px] underline-offset-4 hover:bg-klime"
            >
              Back to sign in
            </Link>
          </form>
        </>
      )}
    </StickerCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  )
}
