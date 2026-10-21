'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Download, LogOut, Menu, Monitor, UserRound, X } from 'lucide-react'
import { homeForRole, useAuth } from '@/lib/auth/AuthProvider'
import { KioskLogo } from '@/kiosk/components/Logo'
import { Badge } from '@/components/site/primitives'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/locations', label: 'Locations' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const

export function PublicHeader() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!accountOpen) return
    const onDown = (e: PointerEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [accountOpen])

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-black bg-kpaper">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Smart Print home">
          <KioskLogo className="size-10 sm:size-11" alt="" />
          <span className="hidden font-display text-lg font-bold leading-none tracking-tight min-[420px]:inline sm:text-xl">
            SMART
            <span className="kb-lime ml-1 inline-block rotate-1 rounded-md border-2 border-black px-1.5 py-0.5">
              PRINT
            </span>
          </span>
        </Link>

        <nav aria-label="Site sections" className="ml-4 hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 font-display text-sm font-bold transition-colors',
                  active ? 'bg-black text-white' : 'hover:bg-klime',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <NBDownloadLink className="hidden sm:inline-flex" />

          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex min-h-11 items-center gap-2 rounded-xl border-[3px] border-black bg-white px-3 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-kblue border-2 border-black">
                  <UserRound className="size-4" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
                <ChevronDown className="size-4" strokeWidth={2.5} aria-hidden />
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl border-[3px] border-black bg-white p-3 shadow-[6px_6px_0_#000]"
                >
                  <p className="truncate px-1 font-display text-base font-bold">{user.name}</p>
                  <p className="mb-3 mt-0.5 truncate px-1 text-xs font-semibold text-black/55">{user.email}</p>
                  <div className="mb-3 px-1">
                    <Badge tone={user.role === 'admin' ? 'coral' : 'blue'}>
                      {user.role === 'admin' ? 'Admin' : 'Operator'}
                    </Badge>
                  </div>
                  <Link
                    role="menuitem"
                    href={homeForRole(user.role)}
                    className="flex min-h-12 items-center gap-2.5 rounded-xl border-[3px] border-black bg-klime px-3 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
                  >
                    <Monitor className="size-4" strokeWidth={2.5} aria-hidden />
                    Go to dashboard
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setAccountOpen(false)
                      void signOut()
                    }}
                    className="mt-2 flex min-h-12 w-full items-center gap-2.5 rounded-xl border-[3px] border-black bg-white px-3 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
                  >
                    <LogOut className="size-4" strokeWidth={2.5} aria-hidden />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex min-h-11 items-center rounded-xl border-[3px] border-black bg-black px-4 font-display text-sm font-bold text-white shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex size-11 items-center justify-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] xl:hidden"
          >
            <Menu className="size-5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={() => setMenuOpen(false)} role="presentation">
          <div
            className="kb-scroll ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-l-[3px] border-black bg-kpaper"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between border-b-[3px] border-black px-4 py-3.5">
              <span className="font-display text-lg font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="size-5" strokeWidth={2.5} aria-hidden />
              </button>
            </div>
            <nav aria-label="Site sections" className="flex flex-col gap-2 p-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-14 items-center rounded-xl border-[3px] border-black bg-white px-4 font-display text-base font-bold shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]"
                >
                  {item.label}
                </Link>
              ))}
              <NBDownloadLink className="mt-2" onNavigate={() => setMenuOpen(false)} />
              {user ? (
                <Link
                  href={homeForRole(user.role)}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-14 items-center rounded-xl border-[3px] border-black bg-kblue px-4 font-display text-base font-bold shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]"
                >
                  <Monitor className="mr-2 size-5" strokeWidth={2.5} aria-hidden />
                  Go to dashboard
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}

function NBDownloadLink({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link
      href="/kiosk"
      onClick={onNavigate}
      className={cn(
        'flex min-h-11 items-center gap-2 rounded-xl border-[3px] border-black bg-klime px-4 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]',
        className,
      )}
    >
      <Download className="size-4" strokeWidth={2.5} aria-hidden />
      Download kiosk app
    </Link>
  )
}
