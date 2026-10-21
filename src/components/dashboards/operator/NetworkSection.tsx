'use client'

/* Network mode — switch the selected kiosk between Wi-Fi and
   offline operation. The scan list is a fixed roster of nearby
   networks; applying a selection updates the kiosk record locally. */

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, ScanLine, Wifi, WifiHigh, WifiLow, WifiOff } from 'lucide-react'
import type { KioskRecord, PublicUser } from '@/lib/data/types'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StatusPill, StickerCard } from '@/components/site/primitives'
import { ChipToggle, ModePill, SectionTitle, setKioskOffline, setKioskOnline } from './parts'
import { cn } from '@/lib/utils'

/** Kiosks remember the Wi-Fi they were applied to during this session. */
type KioskWithWifi = KioskRecord & { wifiSsid?: string }

const NETWORKS = [
  { ssid: 'SmartPrint-HQ', security: 'WPA2', signal: 'Strong' },
  { ssid: 'Café_Guest', security: 'Open', signal: 'Strong' },
  { ssid: 'PLDT_Fibr_5G', security: 'WPA2/WPA3', signal: 'Strong' },
  { ssid: 'HP-Print-42-LaserJet', security: 'WPA2', signal: 'Good' },
  { ssid: 'Neighbor_2.4G', security: 'WPA2', signal: 'Weak' },
] as const

type Network = (typeof NETWORKS)[number]

function signalIcon(signal: Network['signal']): LucideIcon {
  return signal === 'Weak' ? WifiLow : WifiHigh
}

export default function NetworkSection({
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
  const [scanning, setScanning] = useState(false)
  const [ssid, setSsid] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  const kiosk = kiosks.find((k) => k.id === selectedKioskId) ?? kiosks[0] ?? null
  if (!kiosk) {
    return (
      <section aria-labelledby="op-network-title" className="flex flex-col gap-4">
        <SectionTitle title="Network mode" />
        <StickerCard className="p-6 text-center font-semibold text-black/60">
          No kiosks are assigned to your account yet.
        </StickerCard>
      </section>
    )
  }

  const selected = NETWORKS.find((n) => n.ssid === ssid) ?? null
  const needsPassword = selected !== null && selected.security !== 'Open'
  const tooShort = needsPassword && password.length > 0 && password.length < 8
  const canApply = selected !== null && (!needsPassword || password.length >= 8)
  const wifiSsid = (kiosk as KioskWithWifi).wifiSsid

  const apply = () => {
    if (!selected || !canApply) return
    setKioskOnline(kiosk, selected.ssid)
    bump()
  }

  const useOffline = () => {
    setKioskOffline(kiosk)
    bump()
  }

  return (
    <section aria-labelledby="op-network-title" className="flex flex-col gap-4">
      <SectionTitle title="Network mode" sub="Switch the kiosk between Wi-Fi and offline operation." />

      {/* Kiosk picker */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose kiosk">
        {kiosks.map((k) => (
          <ChipToggle key={k.id} active={k.id === kiosk.id} onClick={() => onSelectKiosk(k.id)}>
            {k.name}
          </ChipToggle>
        ))}
      </div>

      {/* Current state */}
      <StickerCard className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ModePill mode={kiosk.mode} />
          {wifiSsid ? <Badge tone="lime">Wi-Fi · {wifiSsid}</Badge> : null}
          {kiosk.mode === 'online' && wifiSsid ? (
            <StatusPill tone="ok" icon={CheckCircle2} className="px-2 py-0.5 text-[11px]">
              Connected to {wifiSsid}
            </StatusPill>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-black/60">{kiosk.site}</p>
        {kiosk.mode === 'offline' ? (
          <p className="rounded-xl border-[3px] border-black bg-kpaper px-3 py-2 text-sm font-bold leading-snug">
            QR upload and e-wallet disabled, cash still works.
          </p>
        ) : null}
      </StickerCard>

      {/* Scan + apply */}
      <StickerCard className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Wifi className="size-5" strokeWidth={2.5} aria-hidden />
            Wi-Fi setup
          </h3>
          <NBButton
            tone="blue"
            className="w-full sm:w-auto"
            icon={<ScanLine className="size-5" strokeWidth={2.5} aria-hidden />}
            onClick={() => setScanning(true)}
          >
            {scanning ? 'Rescan networks' : 'Scan Wi-Fi networks'}
          </NBButton>
        </div>

        {scanning ? (
          <>
            <ul className="flex flex-col gap-2">
              {NETWORKS.map((net) => {
                const Icon = signalIcon(net.signal)
                return (
                  <li key={net.ssid}>
                    <button
                      type="button"
                      onClick={() => setSsid(net.ssid)}
                      aria-pressed={ssid === net.ssid}
                      className={cn(
                        'flex min-h-14 w-full items-center gap-3 rounded-xl border-[3px] border-black px-3 py-2 text-left shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]',
                        ssid === net.ssid ? 'bg-klime' : 'bg-white',
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border-[3px] border-black bg-white">
                        <Icon className="size-5" strokeWidth={2.5} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm font-bold">{net.ssid}</span>
                        <span className="mt-1 inline-block">
                          <Badge tone={net.security === 'Open' ? 'lime' : 'blue'}>{net.security}</Badge>
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-black/60">{net.signal}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-black/55">Wi-Fi password</span>
                <input
                  type="password"
                  value={password}
                  disabled={selected?.security === 'Open'}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    selected
                      ? selected.security === 'Open'
                        ? 'Open network — no password needed'
                        : 'At least 8 characters'
                      : 'Pick a network first'
                  }
                  aria-label="Wi-Fi password"
                  className="h-12 w-full rounded-xl border-[3px] border-black bg-white px-3 font-display text-base font-bold focus:outline-none focus:ring-2 focus:ring-klime disabled:bg-kpaper disabled:text-black/40"
                />
                {tooShort ? (
                  <span className="text-xs font-bold text-kcoral">Password needs at least 8 characters.</span>
                ) : null}
              </label>
              <NBButton
                tone="lime"
                className="w-full sm:w-auto"
                icon={<CheckCircle2 className="size-5" strokeWidth={2.5} aria-hidden />}
                onClick={apply}
                disabled={!canApply}
              >
                Apply
              </NBButton>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium text-black/60">
            Scan to list the networks within range of {kiosk.name}, pick one and apply it.
          </p>
        )}
      </StickerCard>

      {/* Offline */}
      <StickerCard className="flex flex-col gap-3 p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <WifiOff className="size-5" strokeWidth={2.5} aria-hidden />
          Offline operation
        </h3>
        <p className="text-sm font-medium leading-snug text-black/65">
          Keeps Bluetooth and USB uploads plus cash payments working when the site has no usable internet.
        </p>
        <NBButton
          tone="white"
          className="w-full sm:w-auto"
          icon={<WifiOff className="size-5" strokeWidth={2.5} aria-hidden />}
          onClick={useOffline}
        >
          Use offline mode
        </NBButton>
      </StickerCard>
    </section>
  )
}
