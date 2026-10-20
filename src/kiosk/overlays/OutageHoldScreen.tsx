'use client'

import { Loader2, WifiOff } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { phaseLabel } from '@/kiosk/lib/format'
import { KCard, StatusPill } from '@/kiosk/components/primitives'

export function OutageHoldScreen() {
  const { state } = useKiosk()

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <KCard className="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center" aria-live="polite">
        <span className="kb-blue flex size-16 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
          <WifiOff className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-bold">Connection lost</h1>
        <p className="text-[15px] font-medium text-black/70">
          Your transaction is on hold and safe. Printing and payments continue automatically when the connection
          comes back.
        </p>

        <StatusPill tone="info" icon={WifiOff} className="justify-start text-left">
          On hold · {phaseLabel(state.outage.resumePhase ?? state.phase)}
        </StatusPill>

        <div className="flex items-center gap-2 text-sm font-bold text-black/60">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          Waiting for the connection to return…
        </div>
      </KCard>
    </div>
  )
}
