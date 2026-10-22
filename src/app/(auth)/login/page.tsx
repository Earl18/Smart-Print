'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  Circle,
  KeyRound,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { homeForRole, useAuth } from '@/lib/auth/AuthProvider'
import { PillLink, StickerCard, StatusPill } from '@/components/site/primitives'
import { cn } from '@/lib/utils'

/** Demo accounts. Picking a card signs you straight into that dashboard —
    no email or password typing required. The credentials below match the
    seeded accounts so the server session (and every dashboard API) works. */
const ACCOUNTS: {
  key: 'operator' | 'admin'
  label: string
  blurb: string
  email: string
  password: string
  icon: LucideIcon
}[] = [
  {
    key: 'operator',
    label: 'Operator',
    blurb: 'Run the floor — unlock kiosks and help customers print.',
    email: 'operator@smartprint.example',
    password: 'print2025',
    icon: UserRound,
  },
  {
    key: 'admin',
    label: 'Administrator',
    blurb: 'Full control — kiosks, licenses, pricing and users.',
    email: 'admin@smartprint.example',
    password: 'print2025',
    icon: ShieldCheck,
  },
]

function LoginForm() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const nextPath = params.get('next')

  const [selected, setSelected] = useState<'operator' | 'admin'>('operator')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in? Go straight to the right dashboard.
  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath && nextPath.startsWith('/') ? nextPath : homeForRole(user.role))
    }
  }, [loading, user, router, nextPath])

  const account = ACCOUNTS.find((a) => a.key === selected) ?? ACCOUNTS[0]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    const res = await signIn(account.email, account.password)
    setSubmitting(false)
    if (!res.ok || !res.user) {
      setError(res.error ?? 'Sign-in failed. Please try again.')
      return
    }
    // Redirect by account role (or the page that sent us here).
    router.replace(nextPath && nextPath.startsWith('/') ? nextPath : homeForRole(res.user.role))
  }

  return (
    <StickerCard className="w-full max-w-md p-6 sm:p-8" as="section">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Sign in</h1>
      <p className="mt-1.5 text-sm font-semibold text-black/60">
        Choose an account type and jump straight in.
      </p>

      {error ? (
        <div role="alert" className="mt-5">
          <StatusPill tone="error" icon={TriangleAlert}>
            {error}
          </StatusPill>
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <div role="radiogroup" aria-label="Account type" className="flex flex-col gap-3">
          {ACCOUNTS.map((acc) => {
            const active = selected === acc.key
            const Icon = acc.icon
            return (
              <button
                key={acc.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(acc.key)}
                className={cn(
                  'flex items-center gap-3.5 rounded-2xl border-[3px] border-black p-4 text-left transition-all duration-150',
                  active
                    ? 'kb-lime shadow-[4px_4px_0_#000]'
                    : 'bg-white shadow-[2px_2px_0_#000] hover:-translate-y-0.5 hover:bg-kpaper hover:shadow-[4px_4px_0_#000]',
                )}
              >
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black',
                    active ? 'bg-white' : 'bg-kpaper',
                  )}
                >
                  <Icon className="size-6" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-bold">{acc.label}</span>
                  <span className="block text-sm font-semibold text-black/60">{acc.blurb}</span>
                </span>
                {active ? (
                  <CheckCircle2 className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Circle className="size-6 shrink-0 text-black/30" strokeWidth={2.5} aria-hidden />
                )}
              </button>
            )
          })}
        </div>

        <button type="submit" disabled={submitting} className="kb-btn kb-btn-lime mt-1 w-full">
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
              Signing in…
            </>
          ) : (
            `Sign in as ${account.label}`
          )}
        </button>

        <PillLink
          href="/forgot-password"
          icon={KeyRound}
          iconClassName="group-hover:-rotate-12"
          className="self-center"
        >
          Forgot your password?
        </PillLink>
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
