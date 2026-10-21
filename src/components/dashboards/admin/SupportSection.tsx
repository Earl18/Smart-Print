'use client'

/* Section 5 — Support events: customer reports, incidents and refunds,
   with a dialog that opens the linked record for each kind. */

import { useState } from 'react'
import { MessageSquareWarning, TriangleAlert, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DataTable } from '@/components/site/DataTable'
import { Dialog } from '@/components/site/Dialog'
import { Badge, StatusPill } from '@/components/site/primitives'
import { customerReports, incidents, kiosks, supportEvents, transactions } from '@/lib/data/db'
import type { SupportEvent } from '@/lib/data/types'
import {
  DetailItem,
  DetailList,
  EventStatusBadge,
  MonoChip,
  SectionHead,
  fmtDateTime,
  peso,
  timeAgo,
} from './shared'

const KIND_META: Record<SupportEvent['kind'], { label: string; icon: LucideIcon }> = {
  report: { label: 'Report', icon: MessageSquareWarning },
  incident: { label: 'Incident', icon: TriangleAlert },
  refund: { label: 'Refund', icon: Undo2 },
}

const REPORT_CODES: Record<string, string> = {
  lines: 'Lines on the page',
  faded: 'Faded print',
  wrong_missing: 'Wrong or missing pages',
  damaged: 'Damaged pages',
  other: 'Something else',
}

const SEVERITY_META = {
  critical: { tone: 'error' as const, word: 'Critical' },
  major: { tone: 'error' as const, word: 'Major' },
  minor: { tone: 'info' as const, word: 'Minor' },
}

const COMPONENT_WORDS: Record<string, string> = {
  printer: 'Printer',
  paper: 'Paper',
  cash: 'Cash acceptor',
  wallet: 'E-wallet',
  network: 'Network',
  software: 'Software',
}

export function SupportSection({ now }: { now: Date }) {
  const [selected, setSelected] = useState<SupportEvent | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Support events"
        sub="Customer reports, kiosk incidents and refunds from across the fleet. Select one to open the linked record."
      />

      <DataTable
        rows={supportEvents}
        rowKey={(e) => e.id}
        onRowClick={(e) => setSelected(e)}
        cardTitle={(e) => e.summary}
        cardSub={(e) => <EventStatusBadge status={e.status} />}
        columns={[
          {
            key: 'kind',
            header: 'Kind',
            render: (e) => {
              const meta = KIND_META[e.kind]
              return (
                <span className="inline-flex items-center gap-1.5 font-display font-bold">
                  <meta.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  {meta.label}
                </span>
              )
            },
            text: (e) => KIND_META[e.kind].label,
          },
          { key: 'ref', header: 'Reference', render: (e) => <MonoChip>{e.ref}</MonoChip>, text: (e) => e.ref },
          { key: 'summary', header: 'Summary', render: (e) => <span className="font-semibold">{e.summary}</span>, text: (e) => e.summary },
          {
            key: 'kiosk',
            header: 'Kiosk',
            render: (e) => kiosks.find((k) => k.id === e.kioskId)?.name ?? '—',
            text: (e) => kiosks.find((k) => k.id === e.kioskId)?.name ?? '—',
          },
          {
            key: 'age',
            header: 'Age',
            render: (e) => <span className="text-black/70">{timeAgo(e.at, now)}</span>,
            text: (e) => timeAgo(e.at, now),
          },
          {
            key: 'status',
            header: 'Status',
            render: (e) => <EventStatusBadge status={e.status} />,
            text: (e) => e.status.charAt(0).toUpperCase() + e.status.slice(1),
            hideOnMobile: true,
          },
        ]}
      />

      <Dialog open={selected !== null} onClose={() => setSelected(null)} title="Support event detail" className="max-w-xl">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const meta = KIND_META[selected.kind]
                return (
                  <span className="inline-flex items-center gap-1.5 font-display text-lg font-bold">
                    <meta.icon className="size-5" strokeWidth={2.5} aria-hidden />
                    {meta.label}
                  </span>
                )
              })()}
              <MonoChip>{selected.ref}</MonoChip>
              <EventStatusBadge status={selected.status} />
            </div>
            <p className="font-semibold">{selected.summary}</p>
            <DetailList>
              <DetailItem k="Kiosk" v={kiosks.find((k) => k.id === selected.kioskId)?.name ?? '—'} />
              <DetailItem k="Raised" v={`${fmtDateTime(selected.at)} (${timeAgo(selected.at, now)})`} />
            </DetailList>
            <LinkedDetail event={selected} />
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

function LinkedDetail({ event }: { event: SupportEvent }) {
  if (event.kind === 'report') {
    const report = customerReports.find((r) => r.id === event.ref)
    if (!report) return <p className="text-sm font-semibold text-black/55">Linked report is no longer available.</p>
    return (
      <div className="rounded-2xl border-[3px] border-black bg-kpaper p-4">
        <p className="mb-2 font-display text-sm font-bold">Linked customer report</p>
        <DetailList>
          <DetailItem k="Issue" v={REPORT_CODES[report.code] ?? report.code} />
          <DetailItem k="Job" v={<MonoChip>{report.jobId}</MonoChip>} />
          <DetailItem k="Note" v={report.note} />
          <DetailItem k="Received" v={fmtDateTime(report.at)} />
        </DetailList>
      </div>
    )
  }

  if (event.kind === 'incident') {
    const incident = incidents.find((i) => i.id === event.ref)
    if (!incident) return <p className="text-sm font-semibold text-black/55">Linked incident is no longer available.</p>
    const severity = SEVERITY_META[incident.severity]
    return (
      <div className="rounded-2xl border-[3px] border-black bg-kpaper p-4">
        <p className="mb-2 font-display text-sm font-bold">Linked incident</p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusPill tone={severity.tone} icon={TriangleAlert}>
            {severity.word}
          </StatusPill>
          <Badge tone="white">{COMPONENT_WORDS[incident.component] ?? incident.component}</Badge>
          <EventStatusBadge status={incident.status} />
        </div>
        <p className="text-sm font-semibold">{incident.message}</p>
        <p className="mt-3 mb-1.5 font-display text-xs font-bold uppercase tracking-wide text-black/55">Timeline</p>
        <ol className="flex flex-col gap-1.5">
          {incident.timeline.map((entry, idx) => (
            <li key={`${incident.id}-${idx}`} className="flex gap-2 text-xs font-semibold text-black/70">
              <span className="shrink-0 font-bold text-black/45">{fmtDateTime(entry.at)}</span>
              <span>{entry.entry}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  // Refund — the linked record is the refunded transaction.
  const tx = transactions.find((t) => t.ref === event.ref && t.status === 'refunded')
  if (!tx) return <p className="text-sm font-semibold text-black/55">Linked transaction is no longer available.</p>
  return (
    <div className="rounded-2xl border-[3px] border-black bg-kpaper p-4">
      <p className="mb-2 font-display text-sm font-bold">Linked refunded transaction</p>
      <DetailList>
        <DetailItem k="Reference" v={<MonoChip>{tx.ref}</MonoChip>} />
        <DetailItem k="Refunded amount" v={<span className="font-display text-base font-bold">{peso(tx.amount)}</span>} />
        <DetailItem k="Payment method" v={tx.method === 'cash' ? 'Cash' : 'E-wallet'} />
        <DetailItem k="Job" v={`${tx.pages} ${tx.color === 'bw' ? 'black & white' : 'colored'} pages · ${tx.paper} · ×${tx.copies} copies`} />
        <DetailItem k="Paid at" v={fmtDateTime(tx.at)} />
      </DetailList>
    </div>
  )
}
