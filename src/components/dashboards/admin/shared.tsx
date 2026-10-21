'use client'

/* ============================================================
   Admin console — shared helpers and small building blocks.
   All data comes from '@/lib/data/db'; nothing is invented here.
   ============================================================ */

import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  FileText,
  Printer,
  TriangleAlert,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, StatusPill } from '@/components/site/primitives'
import { getDiagnostics } from '@/lib/data/db'
import type { ComponentHealth, KioskRecord, LicenseStatus } from '@/lib/data/types'
import { cn } from '@/lib/utils'

/* ---------------- money & time ---------------- */

export const peso = (n: number) => '₱' + n.toLocaleString('en-PH')

export function timeAgo(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** "in 12 days" style label for a future (or past) date. */
export function untilLabel(iso: string, now: Date = new Date()): string {
  const days = Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
  if (days > 1) return `in ${days} days`
  if (days === 1) return 'tomorrow'
  if (days === 0) return 'today'
  return 'expired'
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
}

/* ---------------- effective component health ---------------- */

export type LabComponent = 'printer' | 'cashAcceptor' | 'network'

export const COMPONENT_META: Record<LabComponent | 'paper', { label: string; icon: LucideIcon }> = {
  printer: { label: 'Printer', icon: Printer },
  cashAcceptor: { label: 'Cash acceptor', icon: Banknote },
  network: { label: 'Network', icon: Wifi },
  paper: { label: 'Paper', icon: FileText },
}

export interface EffectiveState {
  state: ComponentHealth
  /** Icon + words wording, per the status contract. */
  word: string
  /** True when the Diagnostics Lab forced this state. */
  forced: boolean
}

/** Diagnostics-lab override ?? the kiosk's own reported value. */
export function effectiveComponent(kiosk: KioskRecord, comp: LabComponent | 'paper'): EffectiveState {
  const override = getDiagnostics(kiosk.id)[comp as LabComponent]
  const base = kiosk[comp]
  if (override === 'failed') return { state: 'failed', word: 'Failed', forced: true }
  if (override === 'offline') return { state: 'failed', word: 'Offline', forced: true }
  if (base === 'failed') return { state: 'failed', word: 'Failed', forced: false }
  if (base === 'warn') return { state: 'warn', word: comp === 'paper' ? 'Low paper' : 'Needs attention', forced: false }
  return { state: 'ok', word: 'OK', forced: false }
}

/** Worst component state across the kiosk, as icon + words. */
export function effectiveKioskHealth(kiosk: KioskRecord): EffectiveState {
  const comps = ['printer', 'cashAcceptor', 'network', 'paper'] as const
  let worst: EffectiveState = { state: 'ok', word: 'OK', forced: false }
  for (const comp of comps) {
    const s = effectiveComponent(kiosk, comp)
    if (s.state === 'failed') return { state: 'failed', word: 'Failed', forced: true }
    if (s.state === 'warn') worst = { state: 'warn', word: 'Needs attention', forced: s.forced }
  }
  return worst
}

/* ---------------- pills & badges (status is ALWAYS icon + words) ---------------- */

export function HealthPill({ state, word, className }: { state: ComponentHealth; word: string; className?: string }) {
  if (state === 'ok') {
    return (
      <StatusPill tone="ok" icon={CheckCircle2} className={className}>
        {word}
      </StatusPill>
    )
  }
  if (state === 'warn') {
    return (
      <StatusPill tone="warn" icon={TriangleAlert} className={className}>
        {word}
      </StatusPill>
    )
  }
  return (
    <StatusPill tone="error" icon={XCircle} className={className}>
      {word}
    </StatusPill>
  )
}

export function KioskStatusPill({ kiosk, className }: { kiosk: KioskRecord; className?: string }) {
  if (kiosk.status === 'online') {
    return (
      <StatusPill tone="ok" icon={Wifi} className={className}>
        Online
      </StatusPill>
    )
  }
  if (kiosk.status === 'maintenance') {
    return (
      <StatusPill tone="info" icon={Wrench} className={className}>
        Maintenance
      </StatusPill>
    )
  }
  return (
    <StatusPill tone="error" icon={WifiOff} className={className}>
      Offline
    </StatusPill>
  )
}

export function LicenseBadge({ status }: { status: LicenseStatus }) {
  const map: Record<LicenseStatus, { tone: 'lime' | 'blue' | 'coral' | 'white'; word: string }> = {
    active: { tone: 'lime', word: 'Active' },
    expiring: { tone: 'blue', word: 'Expiring' },
    expired: { tone: 'coral', word: 'Expired' },
    unassigned: { tone: 'white', word: 'Unassigned' },
  }
  return <Badge tone={map[status].tone}>{map[status].word}</Badge>
}

export function EventStatusBadge({ status }: { status: 'open' | 'acknowledged' | 'resolved' | 'processed' }) {
  const map: Record<string, { tone: 'lime' | 'blue' | 'coral' | 'white'; word: string }> = {
    open: { tone: 'coral', word: 'Open' },
    acknowledged: { tone: 'blue', word: 'Acknowledged' },
    resolved: { tone: 'lime', word: 'Resolved' },
    processed: { tone: 'lime', word: 'Processed' },
  }
  return <Badge tone={map[status].tone}>{map[status].word}</Badge>
}

/* ---------------- form & detail building blocks ---------------- */

export function SectionHead({ title, sub, note }: { title: string; sub?: string; note?: ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {sub ? <p className="mt-1 max-w-2xl text-sm font-semibold text-black/60">{sub}</p> : null}
      {note}
    </div>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-sm font-bold">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs font-semibold text-black/55">{hint}</span> : null}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('kb-input', props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('kb-input min-h-28 resize-y', props.className)} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('kb-input appearance-none pr-10', props.className)} />
}

export function DetailList({ children }: { children: ReactNode }) {
  return <dl className="grid gap-2.5">{children}</dl>
}

export function DetailItem({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-black/15 pb-2 last:border-b-0 last:pb-0">
      <dt className="shrink-0 text-sm font-bold text-black/55">{k}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-semibold">{v}</dd>
    </div>
  )
}

/** Compact inline action button (still a ≥44px touch target). */
export function MiniButton({
  children,
  onClick,
  tone = 'white',
  className,
  disabled,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  tone?: 'white' | 'lime' | 'coral' | 'blue'
  className?: string
  disabled?: boolean
  'aria-label'?: string
}) {
  const toneClass = {
    white: 'bg-white',
    lime: 'bg-klime',
    coral: 'bg-kcoral',
    blue: 'bg-kblue',
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-[3px] border-black px-3.5 font-display text-xs font-bold uppercase tracking-wide shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000] disabled:opacity-40 disabled:shadow-[3px_3px_0_#000]',
        toneClass,
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Mono key chip used for license keys, refs and job ids. */
export function MonoChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-lg border-2 border-black bg-white px-2 py-0.5 font-mono text-xs font-bold break-all',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Date + relative caption used in lists and dialogs. */
export function DateCaption({ iso, now }: { iso: string; now: Date }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-black/50">
      <CalendarDays className="size-3.5" aria-hidden />
      {fmtDate(iso)} · {timeAgo(iso, now)}
    </span>
  )
}
