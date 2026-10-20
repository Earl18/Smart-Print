'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronRight, Printer, Wifi, WifiOff } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { formatClock } from '@/kiosk/lib/format'
import type { Phase } from '@/kiosk/lib/types'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'preferences', label: 'Preferences' },
  { key: 'upload', label: 'Upload' },
  { key: 'review', label: 'Review' },
  { key: 'pay', label: 'Pay' },
  { key: 'print', label: 'Print' },
] as const

function activeStepIndex(phase: Phase): number {
  switch (phase) {
    case 'PREFERENCES':
      return 0
    case 'SOURCE_SELECT':
    case 'RECEIVING':
    case 'SCAN':
      return 1
    case 'REVIEW':
      return 2
    case 'PAYMENT_METHOD':
    case 'PAY_CASH':
    case 'PAY_EWALLET':
      return 3
    case 'PRINTING':
    case 'SUCCESS':
    case 'REPORT_PROBLEM':
      return 4
    default:
      return -1
  }
}

function KioskClock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    const immediate = setTimeout(tick, 0)
    const iv = setInterval(tick, 1000)
    return () => {
      clearTimeout(immediate)
      clearInterval(iv)
    }
  }, [])
  return (
    <time
      className="font-display text-base font-bold tabular-nums sm:text-lg"
      suppressHydrationWarning
      aria-label="Current time"
    >
      {now ? formatClock(now) : '--:--'}
    </time>
  )
}

export function TopBar() {
  const { state } = useKiosk()
  const active = activeStepIndex(state.phase)
  const stepsDone = active < 0 ? STEPS.map(() => false) : STEPS.map((_, i) => i < active)

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b-[3px] border-black bg-kpaper px-3 sm:h-20 sm:gap-6 sm:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span
          aria-hidden
          className="kb-lime flex size-10 rotate-[-2deg] items-center justify-center rounded-xl border-[3px] border-black shadow-[3px_3px_0_#000] sm:size-12"
        >
          <Printer className="size-5 sm:size-7" strokeWidth={2.5} />
        </span>
        <h1 className="font-display text-lg font-bold leading-none tracking-tight sm:text-2xl">
          SMART
          <span className="kb-lime ml-1.5 inline-block rotate-1 rounded-md border-2 border-black px-1.5 py-0.5">
            PRINT
          </span>
        </h1>
      </div>

      {/* Step progress */}
      <nav aria-label="Checkout progress" className="mx-auto hidden md:block">
        <ol className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const done = stepsDone[i]
            const isActive = i === active
            return (
              <li key={step.key} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-4" aria-hidden /> : null}
                <span
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border-[3px] border-black px-2.5 py-1.5',
                    done && 'kb-lime',
                    isActive && 'bg-black text-white',
                    !done && !isActive && 'bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-md border-2 border-black font-display text-xs font-bold',
                      done && 'kb-lime',
                      isActive && 'border-white bg-black text-white',
                      !done && !isActive && 'bg-white',
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
                  </span>
                  <span className="font-display text-sm font-bold">{step.label}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Mobile compact progress */}
      <div className="mx-auto font-display text-sm font-bold md:hidden" aria-hidden>
        {active >= 0 ? `${active + 1}/${STEPS.length} · ${STEPS[active].label}` : ''}
      </div>

      {/* Status cluster */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4 md:ml-0">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border-[3px] border-black px-2 py-1 text-xs font-bold sm:text-sm',
            state.online ? 'kb-lime' : 'kb-coral',
          )}
          role="status"
        >
          {state.online ? (
            <Wifi className="size-4 sm:size-5" strokeWidth={2.5} aria-hidden />
          ) : (
            <WifiOff className="size-4 sm:size-5" strokeWidth={2.5} aria-hidden />
          )}
          {state.online ? 'Online' : 'Offline'}
        </span>
        <KioskClock />
      </div>
    </header>
  )
}
