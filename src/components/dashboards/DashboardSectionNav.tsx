'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { cn } from '@/lib/utils'

type Section = { id: string; label: string; icon: LucideIcon }

export function DashboardSectionNav<T extends string>({
  sections,
  activeSection,
  onSelect,
  label,
  className,
}: {
  sections: ReadonlyArray<Section & { id: T }>
  activeSection: T
  onSelect: (id: T) => void
  label: string
  className?: string
}) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTarget(document.getElementById('dashboard-menu-slot'))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const select = (id: T) => {
    onSelect(id)
    setMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    router.replace('/login')
  }

  if (!target) return null

  return createPortal(
    <div className={cn('hidden sm:block', className)}>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label={`Open ${label.toLowerCase()} menu`}
        aria-expanded={menuOpen}
        className="flex size-11 items-center justify-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#000]"
      >
        <Menu className="size-5" strokeWidth={2.5} aria-hidden />
      </button>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 hidden bg-black/50 sm:flex"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        >
          <div
            className="kb-scroll ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-l-[3px] border-black bg-kpaper"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={label}
          >
            <div className="flex items-center justify-between border-b-[3px] border-black px-4 py-3.5">
              <span className="font-display text-lg font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#000]"
              >
                <X className="size-5" strokeWidth={2.5} aria-hidden />
              </button>
            </div>
            <nav aria-label={label} className="flex flex-col gap-2 p-4">
              {sections.map(({ id, label: sectionLabel, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  aria-current={activeSection === id ? 'page' : undefined}
                  className={cn(
                    'flex min-h-14 items-center gap-3 rounded-xl border-[3px] border-black px-4 text-left font-display text-base font-bold shadow-[4px_4px_0_#000]',
                    activeSection === id ? 'bg-black text-white' : 'bg-white',
                  )}
                >
                  <Icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                  {sectionLabel}
                </button>
              ))}
            </nav>
            <div className="mt-auto border-t-[3px] border-black p-4">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex min-h-14 w-full items-center gap-3 rounded-xl border-[3px] border-black bg-white px-4 text-left font-display text-base font-bold shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]"
              >
                <LogOut className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    target,
  )
}
