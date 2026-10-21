'use client'

/* Section 3 — Operators: accounts that run kiosks day to day.
   Passwords and credentials are never shown anywhere in this console. */

import { useState } from 'react'
import { Mail, ShieldCheck, ShieldOff } from 'lucide-react'
import { DataTable } from '@/components/site/DataTable'
import { Dialog } from '@/components/site/Dialog'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'
import { kiosks, pushAudit, users } from '@/lib/data/db'
import type { PublicUser, User } from '@/lib/data/types'
import { DetailItem, DetailList, SectionHead, fmtDate, fmtDateTime, timeAgo } from './shared'

export function OperatorsSection({ user, bump, now }: { user: PublicUser; bump: () => void; now: Date }) {
  const [selected, setSelected] = useState<User | null>(null)
  const operators = users.filter((u) => u.role === 'operator')

  const setStatus = (operator: User, status: 'active' | 'suspended') => {
    operator.status = status
    pushAudit(
      user.name,
      status === 'suspended' ? 'operator.suspend' : 'operator.reactivate',
      status === 'suspended'
        ? `Suspended operator account ${operator.name}.`
        : `Reactivated operator account ${operator.name}.`,
    )
    setSelected(null)
    bump()
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Operators"
        sub="Accounts that run kiosks day to day. Suspended operators cannot sign in and cannot receive new licenses."
      />

      <DataTable
        rows={operators}
        rowKey={(o) => o.id}
        onRowClick={(o) => setSelected(o)}
        cardTitle={(o) => o.name}
        cardSub={(o) => (o.status === 'active' ? <Badge tone="lime">Active</Badge> : <Badge tone="coral">Suspended</Badge>)}
        columns={[
          { key: 'name', header: 'Name', render: (o) => o.name, text: (o) => o.name },
          { key: 'email', header: 'Email', render: (o) => <span className="break-all">{o.email}</span>, text: (o) => o.email },
          {
            key: 'kiosks',
            header: 'Kiosks',
            render: (o) => {
              const mine = kiosks.filter((k) => o.kioskIds.includes(k.id))
              return (
                <span>
                  <Badge tone="white" className="mr-2">
                    {mine.length}
                  </Badge>
                  <span className="text-black/70">{mine.map((k) => k.name).join(', ')}</span>
                </span>
              )
            },
            text: (o) => {
              const mine = kiosks.filter((k) => o.kioskIds.includes(k.id))
              return `${mine.length} — ${mine.map((k) => k.name).join(', ')}`
            },
          },
          {
            key: 'status',
            header: 'Status',
            render: (o) =>
              o.status === 'active' ? (
                <Badge tone="lime">Active</Badge>
              ) : (
                <Badge tone="coral">Suspended</Badge>
              ),
            text: (o) => (o.status === 'active' ? 'Active' : 'Suspended'),
          },
          {
            key: 'joined',
            header: 'Joined',
            render: (o) => fmtDate(o.createdAt),
            text: (o) => fmtDate(o.createdAt),
            hideOnMobile: true,
          },
        ]}
      />

      <Dialog open={selected !== null} onClose={() => setSelected(null)} title="Operator account">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xl font-bold">{selected.name}</span>
              {selected.status === 'active' ? (
                <Badge tone="lime">Active</Badge>
              ) : (
                <Badge tone="coral">Suspended</Badge>
              )}
            </div>
            <DetailList>
              <DetailItem
                k="Email"
                v={
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    {selected.email}
                  </span>
                }
              />
              <DetailItem k="Role" v={<Badge tone="blue">Operator</Badge>} />
              <DetailItem k="Status" v={selected.status === 'active' ? 'Active — can sign in and operate kiosks' : 'Suspended — cannot sign in'} />
              <DetailItem k="Joined" v={`${fmtDateTime(selected.createdAt)} (${timeAgo(selected.createdAt, now)})`} />
            </DetailList>

            <div>
              <p className="mb-2 font-display text-sm font-bold">Assigned kiosks</p>
              <ul className="flex flex-wrap gap-2">
                {kiosks
                  .filter((k) => selected.kioskIds.includes(k.id))
                  .map((k) => (
                    <li key={k.id}>
                      <Badge tone="white">{k.name}</Badge>
                    </li>
                  ))}
                {kiosks.filter((k) => selected.kioskIds.includes(k.id)).length === 0 ? (
                  <li className="text-sm font-semibold text-black/55">No kiosks assigned.</li>
                ) : null}
              </ul>
            </div>

            <StickerCard tone="cream" className="p-3.5 text-xs font-semibold text-black/65">
              {selected.status === 'suspended'
                ? 'This account cannot sign in, and its kiosks cannot be assigned new licenses until it is reactivated.'
                : 'Suspending an account signs the operator out and blocks its kiosks from receiving new licenses.'}
            </StickerCard>

            <div className="flex flex-col gap-3 sm:flex-row">
              {selected.status === 'active' ? (
                <NBButton
                  tone="coral"
                  onClick={() => setStatus(selected, 'suspended')}
                  icon={<ShieldOff className="size-5" strokeWidth={2.5} aria-hidden />}
                >
                  Suspend operator
                </NBButton>
              ) : (
                <NBButton
                  onClick={() => setStatus(selected, 'active')}
                  icon={<ShieldCheck className="size-5" strokeWidth={2.5} aria-hidden />}
                >
                  Reactivate operator
                </NBButton>
              )}
              <NBButton tone="white" onClick={() => setSelected(null)}>
                Close
              </NBButton>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}
