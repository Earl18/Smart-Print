'use client'

/* Kiosks — fleet table for the operator with license state,
   settings version, last sync and mode, plus the first-install
   helper that points at the kiosk setup wizard. */

import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  ClipboardList,
  KeyRound,
  MonitorSmartphone,
  SlidersHorizontal,
  Wifi,
  Wrench,
} from 'lucide-react'
import { licenses } from '@/lib/data/db'
import type { KioskRecord, LicenseRecord, PublicUser } from '@/lib/data/types'
import { DataTable, type DataColumn } from '@/components/site/DataTable'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'
import { ModeTag, SectionTitle, relTime, shortDate } from './parts'

const SETUP_STEPS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: ClipboardList, label: 'Welcome checklist' },
  { icon: Wifi, label: 'Network' },
  { icon: KeyRound, label: 'License' },
  { icon: Wrench, label: 'Device check' },
  { icon: SlidersHorizontal, label: 'Configuration' },
  { icon: CheckCircle2, label: 'Finish' },
]

function licenseFor(kiosk: KioskRecord): LicenseRecord | null {
  return licenses.find((l) => l.key === kiosk.licenseKey) ?? null
}

/** Active unless the record says expiring/expired or expiry is within 30 days. */
function licenseMeta(license: LicenseRecord | null): { tone: 'lime' | 'coral'; word: string; days: number } {
  if (!license) return { tone: 'coral', word: 'Missing', days: 0 }
  const days = Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86_400_000)
  const expiring = license.status === 'expiring' || license.status === 'expired' || days <= 30
  return { tone: expiring ? 'coral' : 'lime', word: expiring ? 'Expiring' : 'Active', days }
}

export default function KiosksSection({ user, kiosks }: { user: PublicUser; kiosks: KioskRecord[] }) {
  const columns: Array<DataColumn<KioskRecord>> = [
    {
      key: 'kiosk',
      header: 'Kiosk',
      render: (k) => <span className="font-display font-bold">{k.name}</span>,
      text: (k) => k.name,
    },
    { key: 'site', header: 'Site', render: (k) => <span className="font-medium">{k.site}</span>, text: (k) => k.site },
    { key: 'mode', header: 'Mode', render: (k) => <ModeTag mode={k.mode} />, text: (k) => (k.mode === 'online' ? 'Online' : 'Offline') },
    {
      key: 'license',
      header: 'License',
      render: (k) => {
        const meta = licenseMeta(licenseFor(k))
        const license = licenseFor(k)
        return (
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone={meta.tone}>{meta.word}</Badge>
            <span className="text-xs font-semibold text-black/55">
              {license ? `expires ${shortDate(license.expiresAt)}` : k.licenseKey}
            </span>
          </span>
        )
      },
      text: (k) => {
        const meta = licenseMeta(licenseFor(k))
        const license = licenseFor(k)
        return `${meta.word}${license ? ` · expires ${shortDate(license.expiresAt)}` : ''}`
      },
    },
    { key: 'settings', header: 'Settings', render: (k) => `v${k.settingsVersion}`, text: (k) => `v${k.settingsVersion}` },
    { key: 'sync', header: 'Last sync', render: (k) => relTime(k.lastSyncAt), text: (k) => relTime(k.lastSyncAt) },
  ]

  return (
    <section aria-labelledby="op-kiosks-title" className="flex flex-col gap-4">
      <SectionTitle title="Kiosks" sub={`${kiosks.length} kiosks assigned to you.`} />

      <DataTable
        columns={columns}
        rows={kiosks}
        rowKey={(k) => k.id}
        cardTitle={(k) => k.name}
        cardSub={(k) => `synced ${relTime(k.lastSyncAt)}`}
        empty="No kiosks are assigned to your account yet."
      />

      <StickerCard tone="lime" className="p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold sm:text-xl">First-install helper</h3>
        <p className="mt-1 max-w-2xl text-sm font-medium leading-snug text-black/75">
          Putting a new kiosk on the floor? The setup wizard on the kiosk screen walks through these six steps and
          resumes by itself after a power cut.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SETUP_STEPS.map((step, i) => (
            <li key={step.label} className="flex items-center gap-3 rounded-xl border-[3px] border-black bg-white px-3 py-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-[3px] border-black bg-klime font-display text-sm font-bold">
                {i + 1}
              </span>
              <span className="flex items-center gap-2 text-sm font-bold">
                <step.icon className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                {step.label}
              </span>
            </li>
          ))}
        </ol>
        <NBButton
          href="/kiosk"
          tone="white"
          className="mt-4 w-full sm:w-auto"
          icon={<MonitorSmartphone className="size-5" strokeWidth={2.5} aria-hidden />}
        >
          Open the kiosk to run first-time setup
        </NBButton>
      </StickerCard>
    </section>
  )
}
