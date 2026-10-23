'use client'

/* Section 6 — Diagnostics Lab: force component states, preview the
   customer impact, and run power-loss tests. Every action is audited. */

import { useEffect, useRef, useState } from 'react'
import {
  Banknote,
  CheckCircle2,
  Eraser,
  FlaskConical,
  PauseCircle,
  RotateCcw,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react'
import { Dialog } from '@/components/site/Dialog'
import { NBButton } from '@/components/site/NBButton'
import { StickerCard } from '@/components/site/primitives'
import {
  getDiagnostics,
  kiosks,
  operatorSettings,
  pushAudit,
  pushIncident,
  resetDiagnostics,
  setDiagnostic,
} from '@/lib/data/db'
import type { DiagnosticComponent, DiagnosticState } from '@/lib/data/db'
import type { IncidentComponent, PublicUser } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import { COMPONENT_META, DetailItem, DetailList, HealthPill, SectionHead, effectiveComponent } from './shared'

const LAB_COMPONENTS: DiagnosticComponent[] = ['printer', 'cashAcceptor', 'network']

const INCIDENT_COMPONENT: Record<DiagnosticComponent, IncidentComponent> = {
  printer: 'printer',
  cashAcceptor: 'cash',
  network: 'network',
}

const COMPONENT_WORDS: Record<DiagnosticComponent, string> = {
  printer: 'printer',
  cashAcceptor: 'cash acceptor',
  network: 'network',
}

const SEGMENTS: Array<{ state: DiagnosticState; label: string; icon: typeof CheckCircle2 }> = [
  { state: 'normal', label: 'Normal', icon: CheckCircle2 },
  { state: 'failed', label: 'Failed', icon: XCircle },
  { state: 'offline', label: 'Offline', icon: WifiOff },
]

export function DiagnosticsLabSection({ user, bump }: { user: PublicUser; bump: () => void }) {
  const [kioskId, setKioskId] = useState(kiosks[0]?.id ?? '')
  const [outageTest, setOutageTest] = useState<number | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ moved: false, startX: 0, startLeft: 0 })
  const kiosk = kiosks.find((k) => k.id === kioskId) ?? kiosks[0]

  useEffect(() => {
    const picker = pickerRef.current
    if (!picker) return
    const onWheel = (event: WheelEvent) => {
      if (picker.scrollWidth <= picker.clientWidth || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return
      event.preventDefault()
      picker.scrollLeft += event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY
    }
    picker.addEventListener('wheel', onWheel, { passive: false })
    return () => picker.removeEventListener('wheel', onWheel)
  }, [])

  const startPickerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const picker = pickerRef.current
    if (!picker || picker.scrollWidth <= picker.clientWidth) return
    drag.current = { moved: false, startX: event.clientX, startLeft: picker.scrollLeft }
    const onMove = (moveEvent: PointerEvent) => {
      const distance = moveEvent.clientX - drag.current.startX
      if (Math.abs(distance) > 6) drag.current.moved = true
      if (drag.current.moved) picker.scrollLeft = drag.current.startLeft - distance
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

  if (!kiosk) return null

  const windowMin = operatorSettings.find((s) => s.kioskId === kiosk.id)?.outageRecoveryWindowMin ?? 10

  const setComponent = (component: DiagnosticComponent, state: DiagnosticState) => {
    setDiagnostic(kiosk.id, component, state)
    const detail = `Diagnostics lab set ${COMPONENT_WORDS[component]} to ${state} on ${kiosk.name}.`
    if (state !== 'normal') {
      pushIncident({
        kioskId: kiosk.id,
        severity: state === 'failed' ? 'major' : 'minor',
        component: INCIDENT_COMPONENT[component],
        jobId: null,
        message: `Diagnostics lab set ${COMPONENT_WORDS[component]} to ${state} on ${kiosk.name}.`,
        status: 'open',
        diagnostic: true,
        openedAt: new Date().toISOString(),
        linkedReportId: null,
      })
    }
    pushAudit(user.name, 'diagnostics.set', detail)
    bump()
  }

  const restoreAll = () => {
    resetDiagnostics(kiosk.id)
    pushAudit(user.name, 'diagnostics.reset', `Diagnostics lab restored all components on ${kiosk.name}.`)
    bump()
  }

  const resetAllKiosks = () => {
    resetDiagnostics()
    pushAudit(user.name, 'diagnostics.reset', 'Diagnostics lab reset diagnostic overrides for every kiosk.')
    bump()
  }

  const runOutageTest = (minutes: number) => {
    pushIncident({
      kioskId: kiosk.id,
      severity: 'minor',
      component: 'software',
      jobId: null,
      message: `Power-loss test (${minutes} min) completed on ${kiosk.name}.`,
      status: 'open',
      diagnostic: false,
      openedAt: new Date().toISOString(),
      linkedReportId: null,
    })
    pushAudit(user.name, 'diagnostics.power-test', `Power-loss test (${minutes} min) completed on ${kiosk.name}.`)
    setOutageTest(null)
    bump()
  }

  const overrides = getDiagnostics(kiosk.id)
  const hasOverrides = Object.keys(overrides).length > 0

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Diagnostics Lab"
        sub="Force component states to see how the fleet and customers are affected. Everything you do here is logged to the audit trail."
      />

      {/* Kiosk picker */}
      <div>
        <p className="mb-2 font-display text-sm font-bold">Kiosk under test</p>
        <div
          ref={pickerRef}
          onPointerDown={startPickerDrag}
          className="kb-scroll flex cursor-default select-none gap-2 overflow-x-auto pb-1"
        >
          {kiosks.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                if (!drag.current.moved) setKioskId(k.id)
              }}
              aria-pressed={k.id === kiosk.id}
              className={cn(
                'flex min-h-14 shrink-0 cursor-default items-center gap-2 rounded-xl border-[3px] border-black px-4 font-display text-sm font-bold shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]',
                k.id === kiosk.id ? 'bg-black text-white' : 'bg-white',
              )}
            >
              <FlaskConical className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
              {k.name}
            </button>
          ))}
        </div>
      </div>

      {/* Component controls */}
      <div className="grid gap-3 lg:grid-cols-3">
        {LAB_COMPONENTS.map((component) => {
          const meta = COMPONENT_META[component]
          const effective = effectiveComponent(kiosk, component)
          const override = getDiagnostics(kiosk.id)[component]
          const segValue: DiagnosticState = override ?? 'normal'
          return (
            <StickerCard key={component} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-kpaper">
                    <meta.icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="font-display text-base font-bold leading-tight">{meta.label}</span>
                </span>
                <HealthPill state={effective.state} word={effective.word} className="shrink-0" />
              </div>
              <div role="group" aria-label={`Set ${meta.label} state on ${kiosk.name}`} className="grid grid-cols-3 overflow-hidden rounded-xl border-[3px] border-black">
                {SEGMENTS.map((seg, idx) => {
                  const active = segValue === seg.state
                  return (
                    <button
                      key={seg.state}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setComponent(component, seg.state)}
                      className={cn(
                        'flex min-h-14 items-center justify-center gap-1.5 px-1 font-display text-xs font-bold sm:text-sm',
                        idx > 0 && 'border-l-[3px] border-black',
                        active ? 'bg-black text-white' : 'bg-white',
                      )}
                    >
                      <seg.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                      {seg.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] font-semibold leading-snug text-black/55">
                {override
                  ? 'Lab override active — the kiosk reports this state until you set it back to Normal.'
                  : 'Reporting normally — no lab override.'}
              </p>
            </StickerCard>
          )
        })}
      </div>

      {/* Customer impact preview */}
      <StickerCard tone="cream" className="p-4 sm:p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <FlaskConical className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          Customer impact on {kiosk.name}
        </h3>
        <ul className="mt-3 flex flex-col gap-2.5">
          <ImpactRow
            show={overrides.printer === 'failed' || overrides.printer === 'offline'}
            tone="coral"
            icon={PauseCircle}
            text="Printing pauses; paid jobs are kept as held transactions"
          />
          <ImpactRow
            show={overrides.network === 'failed' || overrides.network === 'offline'}
            tone="coral"
            icon={WifiOff}
            text="QR upload and e-wallet disabled; cash and Bluetooth/USB keep working"
          />
          <ImpactRow
            show={overrides.cashAcceptor === 'failed'}
            tone="coral"
            icon={Banknote}
            text="Cash payments disabled; e-wallet keeps working"
          />
          {!overrides.printer && !overrides.network && !overrides.cashAcceptor ? (
            <li className="flex items-start gap-2.5 text-sm font-bold">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              No forced faults — customers can print normally on this kiosk.
            </li>
          ) : null}
        </ul>
      </StickerCard>

      {/* Lab-wide actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <NBButton
          tone="white"
          onClick={restoreAll}
          disabled={!hasOverrides}
          icon={<RotateCcw className="size-5" strokeWidth={2.5} aria-hidden />}
        >
          Restore all
        </NBButton>
        <NBButton
          tone="coral"
          onClick={resetAllKiosks}
          disabled={!hasOverrides}
          icon={<Eraser className="size-5" strokeWidth={2.5} aria-hidden />}
        >
          Reset all kiosks
        </NBButton>
        {!hasOverrides ? (
          <p className="flex items-center text-xs font-bold text-black/50 sm:ml-1">No lab overrides on any kiosk right now.</p>
        ) : null}
      </div>

      {/* Power-loss tests */}
      <StickerCard className="p-4 sm:p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <Zap className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          Power-loss tests
        </h3>
        <p className="mt-2 text-sm font-semibold text-black/65">
          A printing job survives a power cut of up to {windowMin} minutes: when power returns, {kiosk.name} auto-resumes
          the job exactly where it stopped. Past that window, the job is kept as a held transaction for a free retry or a
          staff refund.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <NBButton tone="blue" onClick={() => setOutageTest(2)} icon={<Zap className="size-5" strokeWidth={2.5} aria-hidden />}>
            Simulate 2-minute outage
          </NBButton>
          <NBButton tone="coral" onClick={() => setOutageTest(11)} icon={<Zap className="size-5" strokeWidth={2.5} aria-hidden />}>
            Simulate 11-minute outage
          </NBButton>
        </div>
      </StickerCard>

      {/* Outage test explainer */}
      <Dialog
        open={outageTest !== null}
        onClose={() => setOutageTest(null)}
        title={`Power-loss test · ${outageTest ?? 0} minutes`}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <NBButton tone="white" onClick={() => setOutageTest(null)}>
              Cancel
            </NBButton>
            <NBButton
              tone={outageTest !== null && outageTest > windowMin ? 'coral' : 'lime'}
              onClick={() => outageTest !== null && runOutageTest(outageTest)}
              icon={<Zap className="size-5" strokeWidth={2.5} aria-hidden />}
            >
              Run the test
            </NBButton>
          </div>
        }
      >
        {outageTest !== null ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Running a power cut of {outageTest} {outageTest === 1 ? 'minute' : 'minutes'} on{' '}
              <strong>{kiosk.name}</strong> while a job is printing:
            </p>
            {outageTest <= windowMin ? (
              <StickerCard tone="lime" className="flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                <p className="text-sm font-bold">
                  {outageTest} minutes is inside the {windowMin}-minute recovery window — when power returns, the kiosk
                  auto-resumes the printing job exactly where it stopped. The customer keeps their receipt and their
                  pages still come out.
                </p>
              </StickerCard>
            ) : (
              <StickerCard tone="coral" className="flex items-start gap-3 p-4">
                <PauseCircle className="mt-0.5 size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                <p className="text-sm font-bold">
                  {outageTest} minutes is beyond the {windowMin}-minute recovery window — the job is kept as a held
                  transaction. The customer retries it free of charge or asks staff for a refund; they never pay twice
                  for the same pages.
                </p>
              </StickerCard>
            )}
            <DetailList>
              <DetailItem k="Recovery window" v={`${windowMin} minutes (operator settings for ${kiosk.name})`} />
              <DetailItem k="Logged as" v="Open software incident on this kiosk" />
              <DetailItem k="Audit trail" v="The test is recorded under your name" />
            </DetailList>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

function ImpactRow({
  show,
  tone,
  icon: Icon,
  text,
}: {
  show: boolean
  tone: 'coral' | 'lime'
  icon: typeof CheckCircle2
  text: string
}) {
  if (!show) return null
  return (
    <li className="flex items-start gap-2.5 text-sm font-bold">
      <Icon
        className={cn('mt-0.5 size-5 shrink-0', tone === 'coral' ? 'text-kcoral' : 'text-black')}
        strokeWidth={2.5}
        aria-hidden
      />
      {text}
    </li>
  )
}
