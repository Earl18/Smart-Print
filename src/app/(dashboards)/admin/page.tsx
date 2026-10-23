'use client'

/* ============================================================
   Admin Console — /admin
   Fleet-wide control: overview, licenses, operators, fleet,
   support events, diagnostics lab, site content and audit log.
   Internal tab state: section menu on sm+, fixed bottom tab
   bar on phones.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from 'react'
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
import { DashboardSectionNav } from '@/components/dashboards/DashboardSectionNav'
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

  const barRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ moved: false, startX: 0, startLeft: 0 })

  useEffect(() => {
    barRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [tab])

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      el.scrollLeft += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const startBarDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = barRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    drag.current = { moved: false, startX: e.clientX, startLeft: el.scrollLeft }
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - drag.current.startX
      if (!drag.current.moved && Math.abs(dx) > 6) drag.current.moved = true
      if (drag.current.moved) el.scrollLeft = drag.current.startLeft - dx
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.setTimeout(() => {
        drag.current.moved = false
      }, 0)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  const selectTab = (id: TabId) => {
    if (drag.current.moved) return
    setTab(id)
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  if (!user) return null // the dashboard layout already gates by role

  return (
    <div className="flex flex-col">
      {/* Dashboard introduction belongs to Overview only. */}
      {tab === 'overview' ? (
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Admin console</h1>
            <Badge tone="coral">Full fleet access</Badge>
          </div>
          <p className="mt-1 max-w-xl text-sm font-semibold text-black/60">
            Fleet-wide control for licenses, kiosks, operators, site content and the audit trail.
          </p>
        </div>
      ) : null}
      <DashboardSectionNav
        sections={TABS}
        activeSection={tab}
        onSelect={setTab}
        label="Admin sections"
      />

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

      <div aria-hidden className="h-24 sm:hidden" />

      <nav
        aria-label="Admin sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-black bg-white sm:hidden"
      >
        <div
          ref={barRef}
          role="tablist"
          aria-label="Admin sections"
          onPointerDown={startBarDrag}
          className="flex cursor-grab select-none overflow-x-auto pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(t.id)}
                className={cn(
                  'flex min-h-16 w-max shrink-0 flex-col items-center justify-center gap-0.5 px-4 font-display text-[10px] font-bold leading-tight',
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
