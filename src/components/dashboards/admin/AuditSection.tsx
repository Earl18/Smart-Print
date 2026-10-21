'use client'

/* Section 8 — Audit log: every admin action, newest first. */

import { DataTable } from '@/components/site/DataTable'
import { Badge } from '@/components/site/primitives'
import { auditLog } from '@/lib/data/db'
import { SectionHead, fmtDateTime, timeAgo } from './shared'

export function AuditSection({ now }: { now: Date }) {
  const rows = [...auditLog].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Audit log"
        sub="Every action taken in this console — license changes, operator accounts, diagnostics and site content — newest first."
      />

      <DataTable
        rows={rows}
        rowKey={(a) => a.id}
        cardTitle={(a) => a.action}
        cardSub={(a) => a.actor}
        columns={[
          {
            key: 'time',
            header: 'When',
            render: (a) => (
              <span>
                {timeAgo(a.at, now)} <span className="font-bold text-black/50">· {fmtDateTime(a.at)}</span>
              </span>
            ),
            text: (a) => `${timeAgo(a.at, now)} · ${fmtDateTime(a.at)}`,
          },
          { key: 'actor', header: 'Actor', render: (a) => <span className="font-display font-bold">{a.actor}</span>, text: (a) => a.actor },
          {
            key: 'action',
            header: 'Action',
            render: (a) => (
              <Badge tone="white" className="font-mono normal-case">
                {a.action}
              </Badge>
            ),
            text: (a) => a.action,
          },
          { key: 'detail', header: 'Detail', render: (a) => <span className="text-black/75">{a.detail}</span>, text: (a) => a.detail },
        ]}
      />
    </div>
  )
}
