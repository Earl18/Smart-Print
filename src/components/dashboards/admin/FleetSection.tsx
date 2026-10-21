'use client'

/* Section 4 — Fleet: every kiosk with full detail and effective
   component healths (diagnostics-lab overrides included). */

import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { DataTable } from '@/components/site/DataTable'
import { Dialog } from '@/components/site/Dialog'
import { Badge, StickerCard } from '@/components/site/primitives'
import { users, kiosks } from '@/lib/data/db'
import type { KioskRecord, PublicUser } from '@/lib/data/types'
import {
  COMPONENT_META,
  DetailItem,
  DetailList,
  HealthPill,
  KioskStatusPill,
  MonoChip,
  SectionHead,
  effectiveComponent,
  fmtDate,
  fmtDateTime,
  timeAgo,
} from './shared'

export function FleetSection({ now }: { now: Date }) {
  const [selected, setSelected] = useState<KioskRecord | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Fleet"
        sub="All registered kiosks. Select a row for full detail and per-component health."
      />

      <DataTable
        rows={kiosks}
        rowKey={(k) => k.id}
        onRowClick={(k) => setSelected(k)}
        cardTitle={(k) => k.name}
        cardSub={(k) =>
          k.status === 'online' ? (
            <Badge tone="lime">Online</Badge>
          ) : k.status === 'maintenance' ? (
            <Badge tone="blue">Maintenance</Badge>
          ) : (
            <Badge tone="coral">Offline</Badge>
          )
        }
        columns={[
          { key: 'name', header: 'Kiosk', render: (k) => <span className="font-display font-bold">{k.name}</span>, text: (k) => k.name },
          { key: 'site', header: 'Site', render: (k) => <span className="text-black/70">{k.site}</span>, text: (k) => k.site },
          {
            key: 'mode',
            header: 'Mode',
            render: (k) =>
              k.mode === 'online' ? <Badge tone="blue">Online mode</Badge> : <Badge tone="white">Offline mode</Badge>,
            text: (k) => (k.mode === 'online' ? 'Online mode' : 'Offline mode'),
            hideOnMobile: true,
          },
          {
            key: 'status',
            header: 'Status',
            render: (k) => <KioskStatusPill kiosk={k} />,
            text: (k) =>
              k.status === 'online' ? 'Online' : k.status === 'maintenance' ? 'Maintenance' : 'Offline',
          },
          {
            key: 'version',
            header: 'Settings',
            render: (k) => <Badge tone="black">v{k.settingsVersion}</Badge>,
            text: (k) => `v${k.settingsVersion}`,
          },
          {
            key: 'sync',
            header: 'Last sync',
            render: (k) => <span className="text-black/70">{timeAgo(k.lastSyncAt, now)}</span>,
            text: (k) => timeAgo(k.lastSyncAt, now),
          },
          {
            key: 'license',
            header: 'License',
            render: (k) => (k.licenseKey ? <MonoChip>{k.licenseKey}</MonoChip> : <span className="text-black/50">—</span>),
            text: (k) => k.licenseKey || '—',
            hideOnMobile: true,
          },
        ]}
      />

      <Dialog open={selected !== null} onClose={() => setSelected(null)} title="Kiosk detail" className="max-w-xl">
        {selected ? <KioskDetail kiosk={selected} now={now} /> : null}
      </Dialog>
    </div>
  )
}

function KioskDetail({ kiosk, now }: { kiosk: KioskRecord; now: Date }) {
  const owner = users.find((u) => u.id === kiosk.ownerOperatorId)
  const components = ['printer', 'cashAcceptor', 'network', 'paper'] as const
  const hasOverride = components.some((c) => effectiveComponent(kiosk, c).forced)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-xl font-bold">{kiosk.name}</h3>
          <p className="text-xs font-semibold text-black/55">{kiosk.site}</p>
        </div>
        <KioskStatusPill kiosk={kiosk} />
      </div>

      <DetailList>
        <DetailItem
          k="Mode"
          v={kiosk.mode === 'online' ? <Badge tone="blue">Online mode</Badge> : <Badge tone="white">Offline mode</Badge>}
        />
        <DetailItem k="Owner operator" v={owner?.name ?? 'Unassigned'} />
        <DetailItem k="Settings version" v={<Badge tone="black">v{kiosk.settingsVersion}</Badge>} />
        <DetailItem
          k="Last sync"
          v={`${fmtDateTime(kiosk.lastSyncAt)} (${timeAgo(kiosk.lastSyncAt, now)})`}
        />
        <DetailItem k="Installed" v={fmtDate(kiosk.installedAt)} />
        <DetailItem k="License key" v={kiosk.licenseKey ? <MonoChip>{kiosk.licenseKey}</MonoChip> : '—'} />
      </DetailList>

      <div>
        <p className="mb-2 font-display text-sm font-bold">Component health (effective)</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {components.map((comp) => {
            const meta = COMPONENT_META[comp]
            const s = effectiveComponent(kiosk, comp)
            return (
              <li
                key={comp}
                className="flex items-center justify-between gap-2 rounded-xl border-[3px] border-black bg-kpaper px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                  <meta.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  {meta.label}
                </span>
                <HealthPill state={s.state} word={s.word} />
              </li>
            )
          })}
        </ul>
      </div>

      {hasOverride ? (
        <StickerCard tone="coral" className="flex items-center gap-3 p-3.5">
          <FlaskConical className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <p className="text-xs font-bold">
            The Diagnostics Lab is forcing at least one component on this kiosk. Restore it there to return to the
            kiosk&apos;s own reports.
          </p>
        </StickerCard>
      ) : null}
    </div>
  )
}
