'use client'

/* Incidents — the operator's own incidents, newest first, with the
   full timeline, the linked customer report and an Acknowledge
   action (open → acknowledged, logged to the audit trail). */

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Banknote, Bell, BellRing, CheckCircle2, Cpu, FileText, Printer, Wallet, Wifi } from 'lucide-react'
import { customerReports, incidents, pushAudit } from '@/lib/data/db'
import type {
  CustomerReport,
  Incident,
  IncidentComponent,
  IncidentSeverity,
  IncidentStatus,
  KioskRecord,
  PublicUser,
} from '@/lib/data/types'
import { DataTable, type DataColumn } from '@/components/site/DataTable'
import { Dialog } from '@/components/site/Dialog'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StatusPill, StickerCard } from '@/components/site/primitives'
import { SectionTitle, acknowledgeIncident, fullStamp, relTime } from './parts'

const SEVERITY: Record<IncidentSeverity, { tone: 'coral' | 'blue' | 'white'; word: string }> = {
  critical: { tone: 'coral', word: 'Critical' },
  major: { tone: 'blue', word: 'Major' },
  minor: { tone: 'white', word: 'Minor' },
}

const COMPONENT_META: Record<IncidentComponent, { icon: LucideIcon; word: string }> = {
  printer: { icon: Printer, word: 'Printer' },
  paper: { icon: FileText, word: 'Paper' },
  cash: { icon: Banknote, word: 'Cash acceptor' },
  wallet: { icon: Wallet, word: 'E-wallet' },
  network: { icon: Wifi, word: 'Network' },
  software: { icon: Cpu, word: 'Software' },
}

const STATUS_META: Record<IncidentStatus, { tone: 'error' | 'info' | 'ok'; icon: LucideIcon; word: string }> = {
  open: { tone: 'error', icon: BellRing, word: 'Open' },
  acknowledged: { tone: 'info', icon: Bell, word: 'Acknowledged' },
  resolved: { tone: 'ok', icon: CheckCircle2, word: 'Resolved' },
}

const REPORT_CODE: Record<CustomerReport['code'], string> = {
  lines: 'Lines on the page',
  faded: 'Faded print',
  wrong_missing: 'Wrong or missing pages',
  damaged: 'Damaged pages',
  other: 'Other issue',
}

export default function IncidentsSection({
  user,
  kiosks,
  bump,
}: {
  user: PublicUser
  kiosks: KioskRecord[]
  bump: () => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  const kioskName = (id: string) => kiosks.find((k) => k.id === id)?.name ?? id
  const rows = incidents
    .filter((i) => user.kioskIds.includes(i.kioskId))
    .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
  const openCount = rows.filter((i) => i.status === 'open').length
  const current = openId ? (incidents.find((i) => i.id === openId) ?? null) : null

  const acknowledge = () => {
    if (!current || current.status !== 'open') return
    const kiosk = kiosks.find((k) => k.id === current.kioskId)
    acknowledgeIncident(current)
    pushAudit(
      user.name,
      'incident.acknowledge',
      `Acknowledged ${current.severity} ${COMPONENT_META[current.component].word.toLowerCase()} incident on ${
        kiosk?.name ?? current.kioskId
      }${current.jobId ? ` (${current.jobId})` : ''}.`,
    )
    bump()
  }

  const columns: Array<DataColumn<Incident>> = [
    {
      key: 'severity',
      header: 'Severity',
      render: (i) => <Badge tone={SEVERITY[i.severity].tone}>{SEVERITY[i.severity].word}</Badge>,
      text: (i) => SEVERITY[i.severity].word,
    },
    {
      key: 'component',
      header: 'Component',
      render: (i) => {
        const meta = COMPONENT_META[i.component]
        return (
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <meta.icon className="size-4" strokeWidth={2.5} aria-hidden />
            {meta.word}
          </span>
        )
      },
      text: (i) => COMPONENT_META[i.component].word,
    },
    { key: 'kiosk', header: 'Kiosk', render: (i) => kioskName(i.kioskId), text: (i) => kioskName(i.kioskId) },
    { key: 'message', header: 'Message', render: (i) => <span className="font-medium">{i.message}</span>, text: (i) => i.message, hideOnMobile: true },
    { key: 'age', header: 'Age', render: (i) => relTime(i.openedAt), text: (i) => relTime(i.openedAt), hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (i) => {
        const meta = STATUS_META[i.status]
        return (
          <StatusPill tone={meta.tone} icon={meta.icon} className="px-2 py-0.5 text-[11px]">
            {meta.word}
          </StatusPill>
        )
      },
      text: (i) => STATUS_META[i.status].word,
    },
  ]

  return (
    <section aria-labelledby="op-incidents-title" className="flex flex-col gap-4">
      <SectionTitle
        title="Incidents"
        sub={`${rows.length} on your kiosks · ${openCount} open. Click one for the timeline and the customer report.`}
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(i) => i.id}
        cardTitle={(i) => i.message}
        cardSub={(i) => relTime(i.openedAt)}
        onRowClick={(i) => setOpenId(i.id)}
        empty="No incidents on your kiosks. Long may it last."
      />

      <Dialog
        open={current !== null}
        onClose={() => setOpenId(null)}
        title={current ? `Incident · ${kioskName(current.kioskId)}` : 'Incident'}
        footer={
          current ? (
            current.status === 'open' ? (
              <NBButton tone="lime" icon={<Bell className="size-5" strokeWidth={2.5} aria-hidden />} onClick={acknowledge} className="w-full sm:w-auto">
                Acknowledge
              </NBButton>
            ) : (
              <div className="flex items-center justify-center sm:justify-start">
                <StatusPill tone={STATUS_META[current.status].tone} icon={STATUS_META[current.status].icon}>
                  {STATUS_META[current.status].word}
                </StatusPill>
              </div>
            )
          ) : null
        }
      >
        {current ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={SEVERITY[current.severity].tone}>{SEVERITY[current.severity].word}</Badge>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                {(() => {
                  const meta = COMPONENT_META[current.component]
                  return <meta.icon className="size-4" strokeWidth={2.5} aria-hidden />
                })()}
                {COMPONENT_META[current.component].word}
              </span>
              <StatusPill tone={STATUS_META[current.status].tone} icon={STATUS_META[current.status].icon} className="px-2 py-0.5 text-[11px]">
                {STATUS_META[current.status].word}
              </StatusPill>
              {current.jobId ? <Badge tone="black">{current.jobId}</Badge> : null}
            </div>

            <p className="text-sm font-semibold leading-snug">{current.message}</p>

            <div>
              <h3 className="font-display text-xs font-bold uppercase tracking-wide text-black/55">Timeline</h3>
              <ol className="mt-2 flex flex-col gap-2">
                {current.timeline.map((entry, idx) => (
                  <li key={`${entry.at}-${idx}`} className="rounded-xl border-[3px] border-black bg-kpaper px-3 py-2">
                    <p className="text-xs font-bold text-black/55">{fullStamp(entry.at)}</p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug">{entry.entry}</p>
                  </li>
                ))}
              </ol>
            </div>

            {current.linkedReportId
              ? (() => {
                  const report = customerReports.find((r) => r.id === current.linkedReportId)
                  if (!report) return null
                  return (
                    <StickerCard tone="blue" className="p-4">
                      <h3 className="font-display text-xs font-bold uppercase tracking-wide text-black/60">
                        Linked customer report
                      </h3>
                      <p className="mt-1 font-display text-sm font-bold">{REPORT_CODE[report.code]}</p>
                      <p className="mt-1 text-sm font-semibold leading-snug">{report.note}</p>
                      <p className="mt-1 text-xs font-bold text-black/55">
                        {report.jobId} · {fullStamp(report.at)}
                      </p>
                    </StickerCard>
                  )
                })()
              : null}
          </div>
        ) : null}
      </Dialog>
    </section>
  )
}
