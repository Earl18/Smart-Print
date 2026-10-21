'use client'

/* Overview — per-kiosk health cards + today's numbers for the
   operator's own kiosks. Component health respects the admin
   Diagnostics Lab overrides via effectiveHealth(). */

import { Banknote, Bell, CheckCircle2, Hourglass, Smartphone, TriangleAlert } from 'lucide-react'
import { heldTransactions, incidents, summarizeSales, todayTransactions } from '@/lib/data/db'
import type { KioskRecord, PublicUser } from '@/lib/data/types'
import type { LucideIcon } from 'lucide-react'
import { StickerCard } from '@/components/site/primitives'
import { COMPONENT_KEYS, HealthPill, ModePill, effectiveHealth, peso } from './parts'

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'white',
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  tone?: 'white' | 'coral' | 'blue'
}) {
  return (
    <StickerCard tone={tone} className="p-4 sm:p-5">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-black/60">
        <Icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
        {label}
      </span>
      <p className="mt-2 font-display text-2xl font-bold leading-none sm:text-3xl">{value}</p>
      {sub ? <p className="mt-1.5 text-xs font-bold text-black/55">{sub}</p> : null}
    </StickerCard>
  )
}

export default function OverviewSection({ user, kiosks }: { user: PublicUser; kiosks: KioskRecord[] }) {
  const sales = summarizeSales(todayTransactions(user.kioskIds))
  const openIncidents = incidents.filter((i) => user.kioskIds.includes(i.kioskId) && i.status === 'open').length
  const heldCount = heldTransactions.filter((h) => user.kioskIds.includes(h.kioskId)).length

  return (
    <section aria-labelledby="op-overview-title" className="flex flex-col gap-4">
      <h2 id="op-overview-title" className="sr-only">
        Overview
      </h2>

      {/* Today's numbers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile icon={Banknote} label="Today's sales" value={peso(sales.total)} sub={`${sales.count} transactions today`} />
        <StatTile icon={Banknote} label="Cash today" value={peso(sales.cash)} />
        <StatTile icon={Smartphone} label="E-wallet today" value={peso(sales.ewallet)} />
        <StatTile
          icon={Bell}
          label="Open incidents"
          value={String(openIncidents)}
          sub="Across your kiosks"
          tone={openIncidents > 0 ? 'coral' : 'white'}
        />
        <StatTile
          icon={Hourglass}
          label="Held jobs"
          value={String(heldCount)}
          sub="Awaiting retry or refund"
          tone={heldCount > 0 ? 'blue' : 'white'}
        />
      </div>

      {/* Per-kiosk status cards */}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kiosks.map((kiosk) => {
          const issues = COMPONENT_KEYS.map((c) => ({ c, health: effectiveHealth(kiosk, c.key) })).filter(
            (x) => x.health !== 'ok',
          )
          return (
            <li key={kiosk.id}>
              <StickerCard className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold leading-tight">{kiosk.name}</h3>
                    <p className="mt-0.5 text-xs font-semibold text-black/55">{kiosk.site}</p>
                  </div>
                  <ModePill mode={kiosk.mode} />
                </div>

                <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {COMPONENT_KEYS.map((c) => (
                    <div
                      key={c.key}
                      className="flex items-center justify-between gap-2 rounded-lg border-2 border-black/10 bg-kpaper px-2.5 py-1.5"
                    >
                      <dt className="text-xs font-bold text-black/55">{c.label}</dt>
                      <dd>
                        <HealthPill health={effectiveHealth(kiosk, c.key)} className="px-2 py-0.5 text-[11px]" />
                      </dd>
                    </div>
                  ))}
                </dl>

                {issues.length > 0 ? (
                  <p className="mt-auto flex items-start gap-2 rounded-xl border-[3px] border-black bg-kcoral px-3 py-2 text-xs font-bold leading-snug sm:text-sm">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    <span>
                      Needs attention:{' '}
                      {issues
                        .map((x) => `${x.c.label} ${x.health === 'failed' ? 'failed' : 'degraded'}`)
                        .join(' · ')}
                    </span>
                  </p>
                ) : (
                  <p className="mt-auto flex items-center gap-2 rounded-xl border-[3px] border-black bg-klime px-3 py-2 text-xs font-bold sm:text-sm">
                    <CheckCircle2 className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    All components healthy
                  </p>
                )}
              </StickerCard>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
