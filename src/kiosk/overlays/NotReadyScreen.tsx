'use client'

import { Paperclip, Printer, RefreshCcw, TriangleAlert } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, StatusPill } from '@/kiosk/components/primitives'

export function NotReadyScreen() {
  const { state, dispatch } = useKiosk()

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <KCard className="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center">
        <span className="kb-coral flex size-16 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
          <TriangleAlert className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-bold">Printer needs attention</h1>
        <p className="text-[15px] font-medium text-black/70">
          {state.printer.message}. Printing is paused, so payments are temporarily disabled. Our staff has been
          notified.
        </p>

        <div className="flex w-full flex-col gap-2">
          <StatusPill tone="error" icon={Printer} className="w-full justify-start py-2.5 text-left">
            {state.printer.message}
          </StatusPill>
          {state.printer.paper === 'out' ? (
            <StatusPill tone="error" icon={Paperclip} className="w-full justify-start py-2.5 text-left">
              Paper tray is empty
            </StatusPill>
          ) : null}
        </div>

        <KButton icon={RefreshCcw} onClick={() => dispatch({ type: 'RECHECK_PRINTER' })}>
          Recheck printer
        </KButton>
      </KCard>
    </div>
  )
}
