'use client'

/* ============================================================
   Admin Console — /admin
   Fleet-wide control: overview, licenses, operators, fleet,
   support events, diagnostics lab, site content and audit log.
   Internal tab state: scrollable chips on sm+, fixed bottom tab
   bar on phones.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react'
import {
  FlaskConical,
  Globe,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Monitor,
  ScrollText,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Badge } from '@/components/site/primitives'
import { cn } from '@/lib/utils'
import { OverviewSection } from '@/components/dashboards/admin/OverviewSection'
import { LicensesSection } from '@/components/dashboards/admin/LicensesSection'
import { OperatorsSection } from '@/components/dashboards/admin/OperatorsSection'
import { FleetSection } from '@/components/dashboards/admin/FleetSection'
import { SupportSection } from '@/components/dashboards/admin/SupportSection'
import { DiagnosticsLabSection } from '@/components/dashboards/admin/DiagnosticsLabSection'
import { SiteContentSection } from '@/components/dashboards/admin/SiteContentSection'
import { AuditSection } from '@/components/dashboards/admin/AuditSection'

type TabId = 'overview' | 'licenses' | 'operators' | 'fleet' | 'support' | 'lab' | 'content' | 'audit'

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'licenses', label: 'Licenses', icon: KeyRound },
  { id: 'operators', label: 'Operators', icon: Users },
  { id: 'fleet', label: 'Fleet', icon: Monitor },
  { id: 'support', label: 'Support', icon: LifeBuoy },
  { id: 'lab', label: 'Diagnostics', icon: FlaskConical },
  { id: 'content', label: 'Content', icon: Globe },
  { id: 'audit', label: 'Audit log', icon: ScrollText },
]

export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabId>('overview')
  // Bumping rev re-renders every section after an in-memory data change.
  const [, setRev] = useState(0)
  const bump = useCallback(() => setRev((r) => r + 1), [])
  // Fresh clock so relative times stay honest (safe: page renders after mount).
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  if (!user) return null // the dashboard layout already gates by role

  return (
    <div className="flex flex-col">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Admin console</h1>
          <p className="mt-1 max-w-xl text-sm font-semibold text-black/60">
            Fleet-wide control for licenses, kiosks, operators, site content and the audit trail.
          </p>
        </div>
        <Badge tone="coral">Full fleet access</Badge>
      </div>

      {/* Chips tab bar — sm and up */}
      <nav
        aria-label="Admin sections"
        className="sticky top-16 z-30 -mx-3 mt-5 border-b-[3px] border-black bg-kpaper px-3 py-3 sm:top-[72px] sm:-mx-6 sm:px-6"
      >
        <div role="tablist" aria-label="Admin sections" className="kb-scroll flex gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex min-h-14 shrink-0 items-center gap-2 rounded-xl border-[3px] border-black px-4 font-display text-sm font-bold shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]',
                  active ? 'bg-black text-white' : 'bg-white',
                )}
              >
                <t.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Active section */}
      <div className="mt-5" role="tabpanel">
        {tab === 'overview' ? <OverviewSection user={user} now={now} /> : null}
        {tab === 'licenses' ? <LicensesSection user={user} bump={bump} now={now} /> : null}
        {tab === 'operators' ? <OperatorsSection user={user} bump={bump} now={now} /> : null}
        {tab === 'fleet' ? <FleetSection now={now} /> : null}
        {tab === 'support' ? <SupportSection now={now} /> : null}
        {tab === 'lab' ? <DiagnosticsLabSection user={user} bump={bump} /> : null}
        {tab === 'content' ? <SiteContentSection user={user} bump={bump} now={now} /> : null}
        {tab === 'audit' ? <AuditSection now={now} /> : null}
      </div>

      {/* Spacer so the fixed phone tab bar never covers content */}
      <div aria-hidden className="h-24 sm:hidden" />

      {/* Bottom tab bar — phones only */}
      <nav
        aria-label="Admin sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-black bg-white sm:hidden"
      >
        <div role="tablist" aria-label="Admin sections" className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 font-display text-[10px] font-bold leading-tight',
                  active ? 'bg-klime' : 'bg-white',
                )}
              >
                <t.icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
