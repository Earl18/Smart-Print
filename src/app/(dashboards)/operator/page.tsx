'use client'

/* ============================================================
   Operator dashboard — Marco's view of his own kiosks.
   Sections are switched with internal tab state: a scrollable
   chip bar from sm upward and a fixed bottom tab bar on phones.
   The (dashboards) layout already handles the auth gate and
   renders this page only after mount.
   ============================================================ */

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChartColumn,
  Hourglass,
  LayoutDashboard,
  Printer,
  SlidersHorizontal,
  TriangleAlert,
  Wifi,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { kiosksForUser } from '@/lib/data/db'
import type { KioskRecord } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import OverviewSection from '@/components/dashboards/operator/OverviewSection'
import SalesSection from '@/components/dashboards/operator/SalesSection'
import IncidentsSection from '@/components/dashboards/operator/IncidentsSection'
import HeldSection from '@/components/dashboards/operator/HeldSection'
import KiosksSection from '@/components/dashboards/operator/KiosksSection'
import SettingsSection from '@/components/dashboards/operator/SettingsSection'
import NetworkSection from '@/components/dashboards/operator/NetworkSection'

type TabId = 'overview' | 'sales' | 'incidents' | 'held' | 'kiosks' | 'settings' | 'network'

const TABS: Array<{ id: TabId; label: string; short: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Monitoring', short: 'Sales', icon: ChartColumn },
  { id: 'incidents', label: 'Incidents', short: 'Alerts', icon: TriangleAlert },
  { id: 'held', label: 'Held & Refunds', short: 'Held', icon: Hourglass },
  { id: 'kiosks', label: 'Kiosks', short: 'Kiosks', icon: Printer },
  { id: 'settings', label: 'Settings', short: 'Config', icon: SlidersHorizontal },
  { id: 'network', label: 'Network mode', short: 'Wi-Fi', icon: Wifi },
]

export default function OperatorPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabId>('overview')
  const [selectedKioskId, setSelectedKioskId] = useState<string | null>(null)
  const [rev, setRev] = useState(0)
  const bump = () => setRev((r) => r + 1)

  // The layout only renders us with a signed-in operator.
  if (!user) return null

  const kiosks: KioskRecord[] = kiosksForUser(user)
  const selectedId =
    selectedKioskId && kiosks.some((k) => k.id === selectedKioskId)
      ? selectedKioskId
      : (kiosks[0]?.id ?? null)

  const dateLabel = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2 pt-1">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Operator dashboard</h1>
        <p className="text-xs font-bold text-black/55 sm:text-sm">{dateLabel}</p>
      </div>

      {/* Tablet/desktop tab bar */}
      <div className="kb-scroll -mx-1 hidden overflow-x-auto px-1 sm:block" role="group" aria-label="Dashboard sections">
        <div className="flex w-max gap-2 pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-2 rounded-xl border-[3px] border-black px-4 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]',
                tab === t.id ? 'bg-black text-white' : 'bg-white',
              )}
            >
              <t.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {tab === 'overview' ? <OverviewSection user={user} kiosks={kiosks} /> : null}
      {tab === 'sales' ? <SalesSection user={user} kiosks={kiosks} /> : null}
      {tab === 'incidents' ? <IncidentsSection user={user} kiosks={kiosks} bump={bump} /> : null}
      {tab === 'held' ? <HeldSection user={user} kiosks={kiosks} /> : null}
      {tab === 'kiosks' ? (
        <KiosksSection
          kiosks={kiosks}
          selectedKioskId={selectedKioskId}
          onSelectKiosk={setSelectedKioskId}
        />
      ) : null}
      {tab === 'settings' ? (
        <SettingsSection
          key={selectedId ?? 'none'}
          user={user}
          kiosks={kiosks}
          selectedKioskId={selectedId}
          onSelectKiosk={setSelectedKioskId}
          bump={bump}
        />
      ) : null}
      {tab === 'network' ? (
        <NetworkSection
          key={selectedId ?? 'none'}
          user={user}
          kiosks={kiosks}
          selectedKioskId={selectedId}
          onSelectKiosk={setSelectedKioskId}
          bump={bump}
        />
      ) : null}

      {/* Spacer so the fixed phone tab bar never covers content */}
      <div aria-hidden className="pb-24 sm:pb-0" />

      {/* Phone bottom tab bar */}
      <nav
        aria-label="Dashboard sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-black bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <div className="grid grid-cols-7">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-bold leading-tight',
                tab === t.id ? 'bg-black text-white' : 'bg-white',
              )}
            >
              <t.icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="max-w-full truncate">{t.short}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
