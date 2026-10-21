'use client'

/* ============================================================
   Operator dashboard — shared helpers and small Neo-Brutalist
   atoms. All values come from the shared data layer; nothing
   is hardcoded here except presentation words/icons.
   ============================================================ */

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  CheckCircle2,
  OctagonX,
  Smartphone,
  TriangleAlert,
  Undo2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import {
  configVersions,
  getDiagnostics,
  pushAudit,
  type DiagnosticComponent,
} from '@/lib/data/db'
import type {
  ComponentHealth,
  Incident,
  KioskMode,
  KioskRecord,
  OperatorSettingsRecord,
  PaymentMethodTag,
  TransactionStatus,
} from '@/lib/data/types'
import { StatusPill } from '@/components/site/primitives'
import { cn } from '@/lib/utils'

/* ---------------- formatting ---------------- */

/** Money in pesos, e.g. ₱1,240. */
export const peso = (n: number): string => '₱' + n.toLocaleString('en-PH')

/** Age of an ISO timestamp, e.g. "4 min ago". */
export function relTime(iso: string, now: Date = new Date()): string {
  const min = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}

/** HH:MM clock time for table rows. */
export function hhmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Medium date + time for dialogs, e.g. "Jun 2, 2025, 2:05 PM". */
export function fullStamp(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

/** Short date, e.g. "12 Aug 2025". */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ---------------- kiosk component health ---------------- */

export const COMPONENT_KEYS = [
  { key: 'paper', label: 'Paper' },
  { key: 'printer', label: 'Printer' },
  { key: 'cashAcceptor', label: 'Cash acceptor' },
  { key: 'network', label: 'Network' },
] as const

export type OverviewComponent = (typeof COMPONENT_KEYS)[number]['key']

const HEALTH_META: Record<ComponentHealth, { tone: 'ok' | 'warn' | 'error'; icon: LucideIcon; word: string }> = {
  ok: { tone: 'ok', icon: CheckCircle2, word: 'OK' },
  warn: { tone: 'warn', icon: TriangleAlert, word: 'Warn' },
  failed: { tone: 'error', icon: OctagonX, word: 'Failed' },
}

/** Component health with any Diagnostics Lab override applied:
    effectiveHealth(kiosk, component) = getDiagnostics(kioskId)[component] ?? kiosk.<component>. */
export function effectiveHealth(kiosk: KioskRecord, component: OverviewComponent): ComponentHealth {
  if (component !== 'paper') {
    const override: DiagnosticComponent = component
    const state = getDiagnostics(kiosk.id)[override]
    if (state === 'failed' || state === 'offline') return 'failed'
  }
  return kiosk[component]
}

export function HealthPill({ health, className }: { health: ComponentHealth; className?: string }) {
  const meta = HEALTH_META[health]
  return (
    <StatusPill tone={meta.tone} icon={meta.icon} className={className}>
      {meta.word}
    </StatusPill>
  )
}

/* ---------------- mode / method / status atoms ---------------- */

export function ModePill({ mode }: { mode: KioskMode }) {
  return mode === 'online' ? (
    <StatusPill tone="ok" icon={Wifi}>
      Online
    </StatusPill>
  ) : (
    <StatusPill tone="warn" icon={WifiOff}>
      Offline
    </StatusPill>
  )
}

/** Compact icon+word used inside table cells. */
export function ModeTag({ mode }: { mode: KioskMode }) {
  const Icon = mode === 'online' ? Wifi : WifiOff
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <Icon className="size-4" strokeWidth={2.5} aria-hidden />
      {mode === 'online' ? 'Online' : 'Offline'}
    </span>
  )
}

const METHOD_META: Record<PaymentMethodTag, { icon: LucideIcon; word: string }> = {
  cash: { icon: Banknote, word: 'Cash' },
  ewallet: { icon: Smartphone, word: 'E-wallet' },
}

export function MethodTag({ method }: { method: PaymentMethodTag }) {
  const meta = METHOD_META[method]
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <meta.icon className="size-4" strokeWidth={2.5} aria-hidden />
      {meta.word}
    </span>
  )
}

export const methodWord = (method: PaymentMethodTag): string => METHOD_META[method].word

export function TxStatusPill({ status }: { status: TransactionStatus }) {
  return status === 'paid' ? (
    <StatusPill tone="ok" icon={CheckCircle2}>
      Paid
    </StatusPill>
  ) : (
    <StatusPill tone="neutral" icon={Undo2}>
      Refunded
    </StatusPill>
  )
}

export const txStatusWord = (status: TransactionStatus): string => (status === 'paid' ? 'Paid' : 'Refunded')

/* ---------------- layout + form atoms ---------------- */

export function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {sub ? <p className="mt-1 text-sm font-medium text-black/60">{sub}</p> : null}
    </div>
  )
}

/** Labelled key/value row for dialogs. */
export function KeyVal({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b-2 border-black/10 py-1.5 last:border-b-0">
      <dt className="shrink-0 text-xs font-bold uppercase tracking-wide text-black/55">{k}</dt>
      <dd className="text-right text-sm font-semibold">{v}</dd>
    </div>
  )
}

/** Selectable chip (min 44px touch target). */
export function ChipToggle({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-xl border-[3px] border-black px-4 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]',
        active ? 'bg-black text-white' : 'bg-white',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Small labelled number input that clamps to [min, max]. */
export function NumField({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  suffix,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  suffix?: string
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-black/55">{label}</span>
      <span className="relative block">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, Math.round(n))))
          }}
          className={cn(
            'h-12 w-full rounded-xl border-[3px] border-black bg-white pl-3 font-display text-base font-bold focus:outline-none focus:ring-2 focus:ring-klime',
            suffix ? 'pr-12' : 'pr-3',
          )}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-black/50">
            {suffix}
          </span>
        ) : null}
      </span>
    </label>
  )
}

/* ---------------- shared record mutations ----------------
   The dashboards own their records: operators manage their own
   incidents, kiosk modes and published settings. These helpers
   mutate the shared records in place and live at module level so
   components stay free of direct writes. */

export function acknowledgeIncident(incident: Incident): void {
  incident.status = 'acknowledged'
}

export function setKioskOnline(kiosk: KioskRecord, wifiSsid: string): void {
  kiosk.mode = 'online'
  ;(kiosk as KioskRecord & { wifiSsid?: string }).wifiSsid = wifiSsid
}

export function setKioskOffline(kiosk: KioskRecord): void {
  kiosk.mode = 'offline'
}

export function setCopyLimit(rec: OperatorSettingsRecord, part: 'min' | 'max', n: number): void {
  rec.copyLimit[part] = n
}

export function toggleAllowedInput(rec: OperatorSettingsRecord, tag: 'qr' | 'bluetooth' | 'usb'): void {
  const order: Array<'qr' | 'bluetooth' | 'usb'> = ['qr', 'bluetooth', 'usb']
  rec.allowedInputs = rec.allowedInputs.includes(tag)
    ? rec.allowedInputs.filter((x) => x !== tag)
    : order.filter((t) => t === tag || rec.allowedInputs.includes(t))
}

export function togglePaymentMethod(rec: OperatorSettingsRecord, tag: 'cash' | 'ewallet'): void {
  const order: Array<'cash' | 'ewallet'> = ['cash', 'ewallet']
  rec.paymentMethods = rec.paymentMethods.includes(tag)
    ? rec.paymentMethods.filter((x) => x !== tag)
    : order.filter((t) => t === tag || rec.paymentMethods.includes(t))
}

export function setUploadTimer(rec: OperatorSettingsRecord, source: 'qr' | 'bluetooth' | 'usb', n: number): void {
  rec.timers.upload[source] = n
}

export function setCashTimer(rec: OperatorSettingsRecord, n: number): void {
  rec.timers.cash = n
}

export function setWalletTimer(rec: OperatorSettingsRecord, n: number): void {
  rec.timers.wallet = n
}

export function setOutageWindow(rec: OperatorSettingsRecord, n: number): void {
  rec.outageRecoveryWindowMin = n
}

export function setNetworkPolicy(rec: OperatorSettingsRecord, policy: OperatorSettingsRecord['networkPolicy']): void {
  rec.networkPolicy = policy
}

export function setOperatorPin(rec: OperatorSettingsRecord, pin: string): void {
  rec.operatorPin = pin
}

export function setRefundAutomation(
  rec: OperatorSettingsRecord,
  policy: OperatorSettingsRecord['refundAutomation'],
): void {
  rec.refundAutomation = policy
}

/** Bumps the kiosk's settings version, records the version entry and
    writes the audit trail. Returns the new version number. */
export function publishSettings(kiosk: KioskRecord, publishedBy: string): number {
  const next = kiosk.settingsVersion + 1
  kiosk.settingsVersion = next
  configVersions.unshift({
    kioskId: kiosk.id,
    version: next,
    publishedBy,
    note: 'Published from the operator dashboard.',
    publishedAt: new Date().toISOString(),
  })
  pushAudit(publishedBy, 'config.publish', `Published settings v${next} for ${kiosk.name}.`)
  return next
}
