'use client'

import { useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, LogOut, MonitorSmartphone, ShieldAlert } from 'lucide-react'
import { homeForRole, useAuth } from '@/lib/auth/AuthProvider'
import { KioskLogo } from '@/kiosk/components/Logo'
import { Badge, StickerCard, StatusPill } from '@/components/site/primitives'
import { NBButton } from '@/components/site/NBButton'
import { cn } from '@/lib/utils'

const emptySubscribe = () => () => {}

/** Renders false during SSR and the very first client snapshot, true after. */
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

/**
 * Shared shell for /operator and /admin: auth gate (signed-out visitors get a
 * polite "Sign-in required" card — done client-side so it also works in
 * embedded previews where cookies are unavailable), "No access" for the wrong
 * role, and a slim top bar with the website/kiosk links.
 */
export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // The dashboards read the shared data layer, whose timestamps are
  // computed at load — render after mount so server and client agree.
  const mounted = useMounted()

  const area = pathname.startsWith('/admin') ? 'admin' : 'operator'

  // Sequence sign-out → navigation: replacing routes while the signed-out
  // state re-render lands can silently abort the navigation.
  const handleSignOut = useCallback(async () => {
    await signOut()
    router.replace('/login')
  }, [signOut, router])

  if (loading || !mounted) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-kpaper">
        <KioskLogo className="size-16" alt="" />
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <Loader2 className="size-5 animate-spin" strokeWidth={2.5} aria-hidden />
          Preparing your dashboard…
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-kpaper px-4">
        <StickerCard className="max-w-md p-8 text-center">
          <StatusPill tone="warn" icon={ShieldAlert}>
            Sign-in required
          </StatusPill>
          <h1 className="mt-4 font-display text-2xl font-bold">Please sign in</h1>
          <p className="mt-2 text-sm font-semibold text-black/60">
            You need a Smart Print account to open this dashboard.
          </p>
          <NBButton href={`/login?next=${pathname}`} size="lg" className="mt-6 w-full">
            Go to sign in
          </NBButton>
        </StickerCard>
      </div>
    )
  }

  if (user.role !== area) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-kpaper px-4">
        <StickerCard className="max-w-md p-8 text-center">
          <StatusPill tone="warn" icon={ShieldAlert}>
            No access
          </StatusPill>
          <h1 className="mt-4 font-display text-2xl font-bold">This area is for {area}s</h1>
          <p className="mt-2 text-sm font-semibold text-black/60">
            You are signed in as {user.name} with a {user.role} account. Your dashboard has everything you
            need.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <NBButton href={homeForRole(user.role)} size="lg" className="flex-1">
              Go to my dashboard
            </NBButton>
            <NBButton href="/" size="lg" tone="white" className="flex-1">
              Back to website
            </NBButton>
          </div>
        </StickerCard>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-kpaper">
      <header className="sticky top-0 z-40 border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-6">
          <Link href={homeForRole(user.role)} className="flex shrink-0 items-center gap-2.5" aria-label="Dashboard home">
            <KioskLogo className="size-10" alt="" />
            <span className="hidden font-display text-lg font-bold leading-none tracking-tight md:block">
              SMART
              <span className="kb-lime ml-1 inline-block rotate-1 rounded-md border-2 border-black px-1.5 py-0.5">
                PRINT
              </span>
            </span>
          </Link>

          <Badge tone={user.role === 'admin' ? 'coral' : 'blue'} className="hidden shrink-0 sm:inline-flex">
            {user.role === 'admin' ? 'Admin console' : 'Operator dashboard'}
          </Badge>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <TopLink href="/" label="Back to website" />
            <TopLink href="/kiosk" label="Open kiosk" primary />
            <div id="dashboard-menu-slot" className="hidden sm:block" />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              aria-label="Sign out"
              className="flex size-11 items-center justify-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] sm:hidden"
            >
              <LogOut className="size-5" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-5 sm:px-6 sm:py-7">{children}</main>

      <footer className="border-t-[3px] border-black">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-3 py-3 text-xs font-bold text-black/55 sm:px-6">
          <span>
            Signed in as {user.name} · {user.role === 'admin' ? 'Administrator' : 'Operator'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MonitorSmartphone className="size-3.5" aria-hidden />
            smartprint.example
          </span>
        </div>
      </footer>
    </div>
  )
}

function TopLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-11 items-center gap-1.5 rounded-xl border-[3px] border-black px-3 font-display text-xs font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] sm:text-sm',
        primary ? 'bg-klime' : 'bg-white',
      )}
    >
      {label === 'Back to website' ? (
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
      ) : (
        <MonitorSmartphone className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
      )}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label === 'Back to website' ? 'Website' : 'Kiosk'}</span>
    </Link>
  )
}
