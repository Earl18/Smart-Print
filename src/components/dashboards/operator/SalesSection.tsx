'use client'

/* Sales Monitoring — date-range totals, a bar chart and the
   transaction list. Totals are always summarizeSales() over the
   exact rows shown, so they can never drift apart. */

import { useState } from 'react'
import { Banknote, Smartphone, Undo2 } from 'lucide-react'
import { sameDayIso, summarizeSales, transactionsInRange } from '@/lib/data/db'
import type { KioskRecord, PublicUser, Transaction } from '@/lib/data/types'
import { perPageRate } from '@/kiosk/lib/pricing'
import { DataTable, type DataColumn } from '@/components/site/DataTable'
import { Dialog } from '@/components/site/Dialog'
import { Badge, StickerCard } from '@/components/site/primitives'
import {
  ChipToggle,
  KeyVal,
  MethodTag,
  SectionTitle,
  TxStatusPill,
  fullStamp,
  hhmm,
  methodWord,
  peso,
  txStatusWord,
} from './parts'

type RangeKey = 'today' | 'yesterday' | 'last7'

const RANGE_LABEL: Record<RangeKey, string> = { today: 'Today', yesterday: 'Yesterday', last7: 'Last 7 days' }
const DAY_MS = 86_400_000

function rangeBounds(key: RangeKey): { fromIso: string; toIso: string } {
  const now = new Date()
  const startToday = new Date(now)
  startToday.setHours(0, 0, 0, 0)
  // Calendar-day bounds (not "now") so Today/Last 7 days always cover the
  // same rows as todayTransactions()/sameDayIso() used elsewhere on the page.
  const endToday = new Date(startToday.getTime() + DAY_MS - 1)
  if (key === 'today') return { fromIso: startToday.toISOString(), toIso: endToday.toISOString() }
  if (key === 'yesterday') {
    return {
      fromIso: new Date(startToday.getTime() - DAY_MS).toISOString(),
      toIso: new Date(startToday.getTime() - 1).toISOString(),
    }
  }
  return { fromIso: new Date(startToday.getTime() - 6 * DAY_MS).toISOString(), toIso: endToday.toISOString() }
}

interface Bar {
  key: string
  label: string
  total: number
}

/** Revenue bar chart built from plain divs — lime bars, black borders. */
function BarChart({ bars, title }: { bars: Bar[]; title: string }) {
  const max = Math.max(...bars.map((b) => b.total), 1)
  return (
    <StickerCard className="p-4 sm:p-5">
      <h3 className="font-display text-base font-bold sm:text-lg">{title}</h3>
      <div className="mt-4 flex h-44 items-end gap-2 sm:h-52 sm:gap-3">
        {bars.map((b) => (
          <div key={b.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <span className="max-w-full truncate text-[10px] font-bold sm:text-xs">{peso(b.total)}</span>
            <div className="flex w-full flex-1 items-end border-b-[3px] border-black">
              <div
                className="w-full rounded-t-md border-[3px] border-black bg-klime"
                style={{ height: `${Math.max((b.total / max) * 100, 3)}%` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] font-bold text-black/60 sm:text-xs">{b.label}</span>
          </div>
        ))}
      </div>
    </StickerCard>
  )
}

function TxDetail({ tx, kioskName }: { tx: Transaction; kioskName: string }) {
  const unitRaw = tx.amount / (tx.pages * tx.copies)
  const perCopy = tx.copies === 1 ? 'copy' : 'copies'
  return (
    <div className="flex flex-col gap-4">
      <dl>
        <KeyVal k="Kiosk" v={kioskName} />
        <KeyVal k="Method" v={<MethodTag method={tx.method} />} />
        <KeyVal k="Amount" v={<span className="font-display text-base font-bold">{peso(tx.amount)}</span>} />
        <KeyVal k="Status" v={<TxStatusPill status={tx.status} />} />
        <KeyVal k="Paper" v={tx.paper} />
        <KeyVal k="Color" v={tx.color === 'bw' ? 'Black & white' : 'Colored'} />
        <KeyVal k="Pages" v={String(tx.pages)} />
        <KeyVal k="Copies" v={String(tx.copies)} />
        <KeyVal k="Time" v={fullStamp(tx.at)} />
      </dl>
      <p className="rounded-xl border-[3px] border-black bg-klime px-3 py-2 text-sm font-bold leading-snug">
        {Number.isInteger(unitRaw)
          ? `${peso(unitRaw)}/page × ${tx.pages} ${tx.pages === 1 ? 'page' : 'pages'} × ${tx.copies} ${perCopy} = ${peso(tx.amount)}`
          : `Rate card: ${peso(perPageRate(tx.paper, tx.color))}/page · Charged ${peso(tx.amount)} for this job`}
      </p>
      <p className="text-xs font-semibold text-black/55">Reference {tx.ref}</p>
    </div>
  )
}

export default function SalesSection({ user, kiosks }: { user: PublicUser; kiosks: KioskRecord[] }) {
  const [range, setRange] = useState<RangeKey>('today')
  const [openTxId, setOpenTxId] = useState<string | null>(null)

  const kioskName = (id: string) => kiosks.find((k) => k.id === id)?.name ?? id
  const bounds = rangeBounds(range)
  const rows = transactionsInRange(bounds.fromIso, bounds.toIso, user.kioskIds)
  const summary = summarizeSales(rows)
  const openTx = openTxId ? rows.find((r) => r.id === openTxId) ?? null : null

  // Per-kiosk bars for a single day, per-day bars across the week.
  const bars: Bar[] =
    range === 'last7'
      ? Array.from({ length: 7 }, (_, i) => {
          const day = new Date()
          day.setDate(day.getDate() - (6 - i))
          day.setHours(0, 0, 0, 0)
          return {
            key: `day-${i}`,
            label: `${day.toLocaleDateString('en-PH', { weekday: 'short' })} ${day.getDate()}`,
            total: summarizeSales(rows.filter((r) => sameDayIso(r.at, day))).total,
          }
        })
      : kiosks.map((k) => ({
          key: k.id,
          label: k.name.replace(/^SP-/, ''),
          total: summarizeSales(rows.filter((r) => r.kioskId === k.id)).total,
        }))

  const columns: Array<DataColumn<Transaction>> = [
    {
      key: 'ref',
      header: 'Ref',
      render: (r) => <span className="font-mono text-xs font-bold">{r.ref}</span>,
      text: (r) => r.ref,
    },
    { key: 'kiosk', header: 'Kiosk', render: (r) => kioskName(r.kioskId), text: (r) => kioskName(r.kioskId) },
    { key: 'method', header: 'Method', render: (r) => <MethodTag method={r.method} />, text: (r) => methodWord(r.method) },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => <span className="font-display font-bold">{peso(r.amount)}</span>,
      text: (r) => peso(r.amount),
    },
    { key: 'status', header: 'Status', render: (r) => <TxStatusPill status={r.status} />, text: (r) => txStatusWord(r.status) },
    { key: 'time', header: 'Time', render: (r) => hhmm(r.at), text: (r) => hhmm(r.at) },
  ]

  return (
    <section aria-labelledby="op-sales-title" className="flex flex-col gap-4">
      <SectionTitle
        title="Sales Monitoring"
        sub="Payments collected at your kiosks. Totals always add up from the rows below."
      />

      {/* Range control */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Date range">
        {(Object.keys(RANGE_LABEL) as RangeKey[]).map((key) => (
          <ChipToggle key={key} active={range === key} onClick={() => setRange(key)}>
            {RANGE_LABEL[key]}
          </ChipToggle>
        ))}
      </div>

      {/* Totals row — same rows as the table, so they match */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StickerCard className="p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-black/60">
            <Banknote className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            Cash
          </span>
          <p className="mt-2 font-display text-2xl font-bold leading-none sm:text-3xl">{peso(summary.cash)}</p>
        </StickerCard>
        <StickerCard className="p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-black/60">
            <Smartphone className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            E-wallet
          </span>
          <p className="mt-2 font-display text-2xl font-bold leading-none sm:text-3xl">{peso(summary.ewallet)}</p>
        </StickerCard>
        <StickerCard className="p-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-black/60">
            <Undo2 className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            Refunds
          </span>
          <p className="mt-2 font-display text-2xl font-bold leading-none sm:text-3xl">{peso(summary.refunds)}</p>
        </StickerCard>
        <StickerCard tone="black" className="p-4 sm:p-5">
          <span className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-white/70">
            Total
            <Badge tone="lime">{summary.count} transactions</Badge>
          </span>
          <p className="mt-2 font-display text-2xl font-bold leading-none text-klime sm:text-3xl">{peso(summary.total)}</p>
        </StickerCard>
      </div>

      <BarChart bars={bars} title={`Revenue · ${RANGE_LABEL[range]}`} />

      <div>
        <h3 className="mb-3 font-display text-base font-bold sm:text-lg">
          Transactions <Badge tone="white" className="ml-1 align-middle">{RANGE_LABEL[range]}</Badge>
        </h3>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          cardTitle={(r) => r.ref}
          cardSub={(r) => peso(r.amount)}
          onRowClick={(r) => setOpenTxId(r.id)}
          empty={`No transactions ${RANGE_LABEL[range].toLowerCase()} on your kiosks.`}
        />
      </div>

      <Dialog open={openTx !== null} onClose={() => setOpenTxId(null)} title={openTx ? `Transaction ${openTx.ref}` : 'Transaction'}>
        {openTx ? <TxDetail tx={openTx} kioskName={kioskName(openTx.kioskId)} /> : null}
      </Dialog>
    </section>
  )
}
