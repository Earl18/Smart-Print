'use client'

import { KeySquare, RefreshCcw, TriangleAlert, WifiOff, Wrench } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, StatusPill } from '@/kiosk/components/primitives'

export function SetupRequiredScreen() {
  const { state, dispatch } = useKiosk()
  const reasons: string[] = []
  if (!state.online) reasons.push('No internet connection')
  if (!state.licenseOk) reasons.push('Kiosk license is not active')

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <KCard className="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center">
        <span className="kb-coral flex size-16 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
          <Wrench className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-bold">Setup required</h1>
        <p className="text-[15px] font-medium text-black/70">
          This kiosk is not ready to serve customers yet. Please ask our staff for assistance.
        </p>

        <ul className="w-full space-y-2">
          {reasons.map((reason) => (
            <li key={reason}>
              <StatusPill
                tone="error"
                icon={state.online ? KeySquare : WifiOff}
                className="w-full justify-start py-2.5 text-left"
              >
                {reason}
              </StatusPill>
            </li>
          ))}
        </ul>

        <KButton icon={RefreshCcw} onClick={() => dispatch({ type: 'RETRY_SETUP' })}>
          Try again
        </KButton>

        <p className="flex items-center gap-2 text-xs font-semibold text-black/50">
          <TriangleAlert className="size-4" aria-hidden /> Reference: kiosk self-check failed
        </p>
      </KCard>
    </div>
  )
}
