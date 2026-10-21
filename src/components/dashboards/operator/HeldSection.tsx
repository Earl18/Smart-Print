'use client'

/* Held transactions & refunds — jobs kept at the kiosk with the
   customer's payment, plus the operator's refunded transactions. */

import { Hourglass, Info, Undo2 } from 'lucide-react'
import { heldTransactions, transactions } from '@/lib/data/db'
import type { KioskRecord, PublicUser } from '@/lib/data/types'
import { DataTable, type DataColumn } from '@/components/site/DataTable'
import type { HeldTransaction, Transaction } from '@/lib/data/types'
import { StickerCard } from '@/components/site/primitives'
import { MethodTag, SectionTitle, fullStamp, methodWord, peso, relTime, txStatusWord, TxStatusPill } from './parts'

export default function HeldSection({ user, kiosks }: { user: PublicUser; kiosks: KioskRecord[] }) {
  const kioskName = (id: string) => kiosks.find((k) => k.id === id)?.name ?? id
  const heldRows = heldTransactions.filter((h) => user.kioskIds.includes(h.kioskId))
  const refundRows = transactions.filter((t) => t.status === 'refunded' && user.kioskIds.includes(t.kioskId))

  const heldColumns: Array<DataColumn<HeldTransaction>> = [
    {
      key: 'ref',
      header: 'Ref',
      render: (h) => <span className="font-mono text-xs font-bold">{h.ref}</span>,
      text: (h) => h.ref,
    },
    { key: 'kiosk', header: 'Kiosk', render: (h) => kioskName(h.kioskId), text: (h) => kioskName(h.kioskId) },
    { key: 'reason', header: 'Reason', render: (h) => <span className="font-medium">{h.reason}</span>, text: (h) => h.reason },
    {
      key: 'amount',
      header: 'Amount paid',
      render: (h) => <span className="font-display font-bold">{peso(h.amountPaid)}</span>,
      text: (h) => peso(h.amountPaid),
    },
    { key: 'held', header: 'Held', render: (h) => relTime(h.heldAt), text: (h) => relTime(h.heldAt) },
  ]

  const refundColumns: Array<DataColumn<Transaction>> = [
    {
      key: 'ref',
      header: 'Ref',
      render: (t) => <span className="font-mono text-xs font-bold">{t.ref}</span>,
      text: (t) => t.ref,
    },
    { key: 'kiosk', header: 'Kiosk', render: (t) => kioskName(t.kioskId), text: (t) => kioskName(t.kioskId) },
    { key: 'method', header: 'Method', render: (t) => <MethodTag method={t.method} />, text: (t) => methodWord(t.method) },
    {
      key: 'amount',
      header: 'Amount',
      render: (t) => <span className="font-display font-bold">{peso(t.amount)}</span>,
      text: (t) => peso(t.amount),
    },
    { key: 'status', header: 'Status', render: (t) => <TxStatusPill status={t.status} />, text: (t) => txStatusWord(t.status) },
    { key: 'when', header: 'When', render: (t) => fullStamp(t.at), text: (t) => fullStamp(t.at) },
  ]

  return (
    <section aria-labelledby="op-held-title" className="flex flex-col gap-4">
      <SectionTitle
        title="Held transactions & refunds"
        sub={`${heldRows.length} held · ${refundRows.length} refunded on your kiosks.`}
      />

      <p className="flex items-start gap-2 rounded-2xl border-[3px] border-black bg-kpaper px-4 py-3 text-sm font-semibold leading-snug">
        <Info className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} aria-hidden />
        <span>{"Held jobs keep the customer's payment until they retry free or receive a refund."}</span>
      </p>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold sm:text-lg">
          <Hourglass className="size-5" strokeWidth={2.5} aria-hidden />
          Held transactions
        </h3>
        <DataTable
          columns={heldColumns}
          rows={heldRows}
          rowKey={(h) => h.id}
          cardTitle={(h) => h.ref}
          cardSub={(h) => peso(h.amountPaid)}
          empty="Nothing held right now — every paid job printed."
        />
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold sm:text-lg">
          <Undo2 className="size-5" strokeWidth={2.5} aria-hidden />
          Refunded transactions
        </h3>
        <DataTable
          columns={refundColumns}
          rows={refundRows}
          rowKey={(t) => t.id}
          cardTitle={(t) => t.ref}
          cardSub={(t) => peso(t.amount)}
          empty="No refunds on your kiosks yet."
        />
      </div>
    </section>
  )
}
