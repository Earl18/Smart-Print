'use client'

/* Section 1 — Overview: fleet health at a glance. */

import { CircleDollarSign, KeyRound, RefreshCw, TriangleAlert, Wifi } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge, StickerCard } from '@/components/site/primitives'
import { incidents, kiosksForUser, licenses, summarizeSales, todayTransactions } from '@/lib/data/db'
import type { PublicUser } from '@/lib/data/types'
import {
  COMPONENT_META,
  HealthPill,
  KioskStatusPill,
  SectionHead,
  daysUntil,
  effectiveComponent,
  effectiveKioskHealth,
  peso,
  timeAgo,
  untilLabel,
  fmtDate,
} from './shared'

export function OverviewSection({ user, now }: { user: PublicUser; now: Date }) {
  const kiosks = kiosksForUser(user)
  const sales = summarizeSales(todayTransactions())
  const openIncidents = incidents.filter((i) => i.status === 'open')
  const expiring = licenses.filter((l) => daysUntil(l.expiresAt, now) <= 30)

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        title="Overview"
        sub="Fleet health across every Smart Print kiosk — sales, incidents, licenses and sync state."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          tone="lime"
          value={peso(sales.total)}
          label="Fleet sales today"
          sub={`${sales.count} transactions · cash ${peso(sales.cash)} · e-wallet ${peso(sales.ewallet)}`}
        />
        <StatCard
          icon={TriangleAlert}
          tone={openIncidents.length > 0 ? 'coral' : 'white'}
          value={String(openIncidents.length)}
          label="Open incidents"
          sub={
            openIncidents.length > 0
              ? `Latest: ${openIncidents[0]?.kioskId ? kiosks.find((k) => k.id === openIncidents[0]!.kioskId)?.name ?? '—' : '—'}`
              : 'Nothing waiting on an operator'
          }
        />
        <StatCard
          icon={KeyRound}
          tone={expiring.length > 0 ? 'blue' : 'white'}
          value={String(expiring.length)}
          label="Licenses expiring"
          sub={
            expiring.length > 0
              ? expiring
                  .map((l) => {
                    const kiosk = kiosks.find((k) => k.id === l.kioskId)
                    return `${kiosk?.name ?? 'Unassigned'} · ${untilLabel(l.expiresAt, now)}`
                  })
                  .join(' · ')
              : 'None within 30 days'
          }
        />
        <StatCard
          icon={Wifi}
          tone="blue"
          value={`${kiosks.filter((k) => k.status === 'online').length}/${kiosks.length}`}
          label="Kiosks online"
          sub={`${kiosks.filter((k) => k.status === 'maintenance').length} in maintenance`}
        />
      </div>

      {/* Kiosk cards */}
      <div>
        <h3 className="font-display text-lg font-bold">Kiosks</h3>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {kiosks.map((kiosk) => {
            const health = effectiveKioskHealth(kiosk)
            const kioskIncidents = incidents.filter((i) => i.kioskId === kiosk.id && i.status === 'open')
            const attention = (['printer', 'cashAcceptor', 'network', 'paper'] as const)
              .map((comp) => ({ comp, s: effectiveComponent(kiosk, comp) }))
              .filter(({ s }) => s.state !== 'ok')
            return (
              <li key={kiosk.id}>
                <StickerCard className="flex h-full flex-col gap-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-display text-base font-bold leading-tight">{kiosk.name}</h4>
                      <p className="mt-0.5 truncate text-xs font-semibold text-black/55">{kiosk.site}</p>
                    </div>
                    <KioskStatusPill kiosk={kiosk} className="shrink-0" />
                  </div>

                  <HealthPill state={health.state} word={health.word} className="self-start" />

                  {attention.length > 0 ? (
                    <ul className="flex flex-col gap-1.5">
                      {attention.map(({ comp, s }) => {
                        const meta = COMPONENT_META[comp]
                        return (
                          <li key={comp} className="flex items-center gap-2 text-xs font-bold text-black/70">
                            <meta.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                            {meta.label}: {s.word}
                            {s.forced ? <Badge tone="coral" className="ml-auto">Lab</Badge> : null}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="flex items-center gap-2 text-xs font-bold text-black/55">
                      All components reporting healthy
                    </p>
                  )}

                  <div className="mt-auto flex flex-col gap-1.5 border-t-2 border-dashed border-black/15 pt-3 text-xs font-bold text-black/60">
                    <span className="flex items-center gap-2">
                      <TriangleAlert className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                      {kioskIncidents.length === 0
                        ? 'No open incidents'
                        : `${kioskIncidents.length} open incident${kioskIncidents.length === 1 ? '' : 's'}`}
                    </span>
                    <span className="flex items-center gap-2">
                      <RefreshCw className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                      Last sync {timeAgo(kiosk.lastSyncAt, now)}
                    </span>
                  </div>
                </StickerCard>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Expiring licenses */}
      <div>
        <h3 className="font-display text-lg font-bold">Licenses expiring in 30 days</h3>
        {expiring.length === 0 ? (
          <p className="mt-3 rounded-2xl border-[3px] border-black bg-white p-5 text-sm font-semibold text-black/60 shadow-[4px_4px_0_#000]">
            No licenses expire within the next 30 days.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {expiring.map((license) => {
              const kiosk = kiosks.find((k) => k.id === license.kioskId)
              return (
                <li key={license.key}>
                  <StickerCard tone="blue" className="flex h-full flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold">{license.key}</span>
                      <Badge tone="white">{untilLabel(license.expiresAt, now)}</Badge>
                    </div>
                    <p className="font-display text-sm font-bold">{kiosk?.name ?? 'Unassigned'}</p>
                    <p className="text-xs font-semibold text-black/65">
                      Expires {fmtDate(license.expiresAt)} · grace period {license.graceDays} days
                    </p>
                  </StickerCard>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  tone,
  value,
  label,
  sub,
}: {
  icon: LucideIcon
  tone: 'lime' | 'coral' | 'blue' | 'white'
  value: string
  label: string
  sub: string
}) {
  const toneClass = {
    lime: 'bg-klime',
    coral: 'bg-kcoral',
    blue: 'bg-kblue',
    white: 'bg-white',
  }[tone]
  return (
    <StickerCard className="flex h-full flex-col gap-3 p-4 sm:p-5">
      <span className={`flex size-11 items-center justify-center rounded-xl border-[3px] border-black ${toneClass}`}>
        <Icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
      </span>
      <div>
        <p className="font-display text-2xl font-bold leading-none tabular-nums sm:text-3xl">{value}</p>
        <p className="mt-1.5 font-display text-[11px] font-bold uppercase tracking-wide sm:text-xs">{label}</p>
      </div>
      <p className="text-xs font-semibold leading-snug text-black/55">{sub}</p>
    </StickerCard>
  )
}
