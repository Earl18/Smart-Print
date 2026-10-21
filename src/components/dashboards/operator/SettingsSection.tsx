'use client'

/* Settings — per-kiosk operator settings editor. Edits mutate the
   shared OperatorSettingsRecord; "Publish configuration" bumps the
   kiosk's settings version and appends to the version history. */

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Banknote, Bluetooth, CheckCircle2, History, Lock, QrCode, Rocket, Smartphone, Usb } from 'lucide-react'
import { configVersions, operatorSettings } from '@/lib/data/db'
import type { KioskRecord, OperatorSettingsRecord, PublicUser } from '@/lib/data/types'
import { PAPER_SIZES } from '@/kiosk/lib/pricing'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StatusPill, StickerCard } from '@/components/site/primitives'
import {
  ChipToggle,
  NumField,
  SectionTitle,
  peso,
  publishSettings,
  relTime,
  setCashTimer,
  setCopyLimit,
  setNetworkPolicy,
  setOperatorPin,
  setOutageWindow,
  setRefundAutomation,
  setUploadTimer,
  setWalletTimer,
  toggleAllowedInput,
  togglePaymentMethod,
} from './parts'

const INPUT_ORDER = ['qr', 'bluetooth', 'usb'] as const
type InputTag = (typeof INPUT_ORDER)[number]

const INPUT_META: Record<InputTag, { icon: LucideIcon; label: string }> = {
  qr: { icon: QrCode, label: 'QR code' },
  bluetooth: { icon: Bluetooth, label: 'Bluetooth' },
  usb: { icon: Usb, label: 'USB drive' },
}

const METHOD_ORDER = ['cash', 'ewallet'] as const
type MethodTag2 = (typeof METHOD_ORDER)[number]

const METHOD_META: Record<MethodTag2, { icon: LucideIcon; label: string }> = {
  cash: { icon: Banknote, label: 'Cash' },
  ewallet: { icon: Smartphone, label: 'E-wallet' },
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-display text-xs font-bold uppercase tracking-wide text-black/55">{title}</h4>
      {children}
    </div>
  )
}

export default function SettingsSection({
  user,
  kiosks,
  selectedKioskId,
  onSelectKiosk,
  bump,
}: {
  user: PublicUser
  kiosks: KioskRecord[]
  selectedKioskId: string | null
  onSelectKiosk: (id: string) => void
  bump: () => void
}) {
  const [publishedV, setPublishedV] = useState<number | null>(null)

  const kiosk = kiosks.find((k) => k.id === selectedKioskId) ?? kiosks[0] ?? null
  const rec: OperatorSettingsRecord | undefined = kiosk
    ? operatorSettings.find((s) => s.kioskId === kiosk.id)
    : undefined

  if (!kiosk || !rec) {
    return (
      <section aria-labelledby="op-settings-title" className="flex flex-col gap-4">
        <SectionTitle title="Settings" />
        <StickerCard className="p-6 text-center font-semibold text-black/60">
          No kiosks are assigned to your account yet.
        </StickerCard>
      </section>
    )
  }

  const publish = () => {
    setPublishedV(publishSettings(kiosk, user.name))
    bump()
  }

  const history = configVersions.filter((v) => v.kioskId === kiosk.id).sort((a, b) => b.version - a.version)

  return (
    <section aria-labelledby="op-settings-title" className="flex flex-col gap-4">
      <SectionTitle title="Settings" sub="Per-kiosk configuration. The kiosk pulls the published version on its next sync." />

      {/* Kiosk picker */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose kiosk">
        {kiosks.map((k) => (
          <ChipToggle key={k.id} active={k.id === kiosk.id} onClick={() => onSelectKiosk(k.id)}>
            {k.name}
          </ChipToggle>
        ))}
      </div>

      {publishedV !== null ? (
        <StatusPill tone="ok" icon={CheckCircle2}>
          Published v{publishedV} to {kiosk.name}
        </StatusPill>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Editor */}
        <StickerCard className="flex flex-col gap-6 p-5">
          <Group title="Rate card (shown on the kiosk)">
            <div className="overflow-hidden rounded-xl border-[3px] border-black">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-[3px] border-black bg-kpaper">
                    <th scope="col" className="px-3 py-2 font-display text-xs font-bold uppercase tracking-wide">
                      Paper
                    </th>
                    <th scope="col" className="px-3 py-2 font-display text-xs font-bold uppercase tracking-wide">
                      Black &amp; white
                    </th>
                    <th scope="col" className="px-3 py-2 font-display text-xs font-bold uppercase tracking-wide">
                      Colored
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PAPER_SIZES.map((size) => (
                    <tr key={size.id} className="border-b-2 border-black/10 last:border-b-0">
                      <td className="px-3 py-2 font-bold">
                        {size.label}{' '}
                        <span className="text-xs font-semibold text-black/50">{size.dims}</span>
                      </td>
                      <td className="px-3 py-2 font-semibold">{peso(rec.prices[size.id].bw)}</td>
                      <td className="px-3 py-2 font-semibold">{peso(rec.prices[size.id].color)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Group>

          <Group title="Copy limit">
            <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
              <NumField
                label="Min"
                value={rec.copyLimit.min}
                min={1}
                max={Math.max(1, rec.copyLimit.max)}
                onChange={(n) => {
                  setCopyLimit(rec, 'min', n)
                  bump()
                }}
              />
              <NumField
                label="Max"
                value={rec.copyLimit.max}
                min={rec.copyLimit.min}
                max={99}
                onChange={(n) => {
                  setCopyLimit(rec, 'max', n)
                  bump()
                }}
              />
            </div>
          </Group>

          <Group title="Allowed file inputs">
            <div className="flex flex-wrap gap-2">
              {INPUT_ORDER.map((tag) => {
                const meta = INPUT_META[tag]
                return (
                  <ChipToggle
                    key={tag}
                    active={rec.allowedInputs.includes(tag)}
                    onClick={() => {
                      toggleAllowedInput(rec, tag)
                      bump()
                    }}
                  >
                    <meta.icon className="size-4" strokeWidth={2.5} aria-hidden />
                    {meta.label}
                  </ChipToggle>
                )
              })}
            </div>
          </Group>

          <Group title="Payment methods">
            <div className="flex flex-wrap gap-2">
              {METHOD_ORDER.map((tag) => {
                const meta = METHOD_META[tag]
                return (
                  <ChipToggle
                    key={tag}
                    active={rec.paymentMethods.includes(tag)}
                    onClick={() => {
                      togglePaymentMethod(rec, tag)
                      bump()
                    }}
                  >
                    <meta.icon className="size-4" strokeWidth={2.5} aria-hidden />
                    {meta.label}
                  </ChipToggle>
                )
              })}
            </div>
          </Group>

          <Group title="Timers (seconds)">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <NumField
                label="QR upload"
                value={rec.timers.upload.qr}
                min={10}
                max={900}
                suffix="s"
                onChange={(n) => {
                  setUploadTimer(rec, 'qr', n)
                  bump()
                }}
              />
              <NumField
                label="Bluetooth upload"
                value={rec.timers.upload.bluetooth}
                min={10}
                max={900}
                suffix="s"
                onChange={(n) => {
                  setUploadTimer(rec, 'bluetooth', n)
                  bump()
                }}
              />
              <NumField
                label="USB upload"
                value={rec.timers.upload.usb}
                min={10}
                max={900}
                suffix="s"
                onChange={(n) => {
                  setUploadTimer(rec, 'usb', n)
                  bump()
                }}
              />
              <NumField
                label="Cash timeout"
                value={rec.timers.cash}
                min={10}
                max={900}
                suffix="s"
                onChange={(n) => {
                  setCashTimer(rec, n)
                  bump()
                }}
              />
              <NumField
                label="Wallet timeout"
                value={rec.timers.wallet}
                min={10}
                max={900}
                suffix="s"
                onChange={(n) => {
                  setWalletTimer(rec, n)
                  bump()
                }}
              />
            </div>
          </Group>

          <Group title="Outage recovery window">
            <div className="sm:max-w-[180px]">
              <NumField
                label="Window"
                value={rec.outageRecoveryWindowMin}
                min={1}
                max={180}
                suffix="min"
                onChange={(n) => {
                  setOutageWindow(rec, n)
                  bump()
                }}
              />
            </div>
            <p className="text-xs font-medium text-black/55">
              Minutes a power interruption is waited out before the paid job becomes a held transaction. Default 10.
            </p>
          </Group>

          <Group title="Network policy">
            <div className="flex flex-wrap gap-2">
              <ChipToggle
                active={rec.networkPolicy === 'online-required'}
                onClick={() => {
                  setNetworkPolicy(rec, 'online-required')
                  bump()
                }}
              >
                Online required
              </ChipToggle>
              <ChipToggle
                active={rec.networkPolicy === 'offline-fallback'}
                onClick={() => {
                  setNetworkPolicy(rec, 'offline-fallback')
                  bump()
                }}
              >
                Offline fallback
              </ChipToggle>
            </div>
          </Group>

          <Group title="Operator PIN">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <Lock className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={6}
                  value={rec.operatorPin}
                  onChange={(e) => {
                    setOperatorPin(rec, e.target.value.replace(/\D/g, '').slice(0, 6))
                    bump()
                  }}
                  aria-label="Operator PIN, 6 digits"
                  className="h-12 w-40 rounded-xl border-[3px] border-black bg-white px-3 font-mono text-lg font-bold tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-klime"
                />
              </label>
              {/^\d{6}$/.test(rec.operatorPin) ? (
                <Badge tone="lime">6 digits</Badge>
              ) : (
                <Badge tone="white">Needs 6 digits</Badge>
              )}
            </div>
            <p className="text-xs font-medium text-black/55">Used for the maintenance panel on the kiosk screen.</p>
          </Group>

          <Group title="Refund automation">
            <div className="flex flex-wrap gap-2">
              <ChipToggle
                active={rec.refundAutomation === 'auto-return'}
                onClick={() => {
                  setRefundAutomation(rec, 'auto-return')
                  bump()
                }}
              >
                Auto-return
              </ChipToggle>
              <ChipToggle
                active={rec.refundAutomation === 'staff-review'}
                onClick={() => {
                  setRefundAutomation(rec, 'staff-review')
                  bump()
                }}
              >
                Staff review
              </ChipToggle>
            </div>
          </Group>
        </StickerCard>

        {/* Publish + history */}
        <div className="flex flex-col gap-4">
          <StickerCard tone="blue" className="p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <Rocket className="size-5" strokeWidth={2.5} aria-hidden />
              Publish configuration
            </h3>
            <p className="mt-1.5 text-sm font-medium leading-snug text-black/80">
              Bumps the settings version on {kiosk.name} and queues the configuration for its next sync. Currently
              live: <Badge tone="black">v{kiosk.settingsVersion}</Badge>
            </p>
            <NBButton
              tone="dark"
              className="mt-4 w-full sm:w-auto"
              icon={<Rocket className="size-5" strokeWidth={2.5} aria-hidden />}
              onClick={publish}
            >
              Publish configuration
            </NBButton>
          </StickerCard>

          <StickerCard className="p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <History className="size-5" strokeWidth={2.5} aria-hidden />
              Version history
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {history.map((v) => (
                <li key={`${v.kioskId}-${v.version}`} className="rounded-xl border-[3px] border-black bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-display text-sm font-bold">
                      v{v.version}
                      {v.version === kiosk.settingsVersion ? <Badge tone="lime">Live</Badge> : null}
                    </span>
                    <span className="text-xs font-bold text-black/55">
                      {v.publishedBy} · {relTime(v.publishedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium leading-snug text-black/70">{v.note}</p>
                </li>
              ))}
              {history.length === 0 ? (
                <li className="rounded-xl border-[3px] border-black bg-white p-3 text-sm font-semibold text-black/60">
                  No published versions yet — publish the first one.
                </li>
              ) : null}
            </ul>
          </StickerCard>
        </div>
      </div>
    </section>
  )
}
