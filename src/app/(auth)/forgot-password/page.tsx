'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Mail, TriangleAlert } from 'lucide-react'
import { StickerCard, StatusPill, PillLink } from '@/components/site/primitives'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string }
      if (!data.ok) setError(data.error ?? 'Something went wrong. Try again.')
      else setSent(data.message ?? 'Check your inbox for the reset link.')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StickerCard className="w-full max-w-md p-6 sm:p-8" as="section">
      {sent ? (
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full border-[3px] border-black bg-klime shadow-[4px_4px_0_#000]">
            <CheckCircle2 className="size-8" strokeWidth={2.5} aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Check your inbox</h1>
          <p className="mt-2 text-sm font-semibold text-black/60">{sent}</p>
          <Link href="/login" className="kb-btn kb-btn-lime mt-6 w-full">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Reset your password</h1>
          <p className="mt-1.5 text-sm font-semibold text-black/60">
            Enter the email on your Smart Print account and we will send you a reset link.
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
              <label htmlFor="forgot-email" className="mb-1.5 block font-display text-sm font-bold">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-black/45" strokeWidth={2.5} aria-hidden />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@smartprint.example"
                  className="kb-input min-h-14 pl-11! font-semibold"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="kb-btn kb-btn-lime mt-1 w-full">
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </button>
            <PillLink href="/login" icon={ArrowLeft} iconClassName="group-hover:-translate-x-1">
              Back to sign in
            </PillLink>
          </form>
        </>
      )}
    </StickerCard>
  )
}
