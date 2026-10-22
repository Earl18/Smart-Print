'use client'

import { Clock, LogOut } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, ProgressBar } from '@/kiosk/components/primitives'

export function InactivityOverlay() {
  const { state } = useKiosk()
  const { warning, remainSec } = state.idle

  return warning ? <InactivityDialog remainSec={remainSec} /> : null
}

function InactivityDialog({ remainSec }: { remainSec: number }) {
  const { dispatch } = useKiosk()

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Inactivity warning"
    >
      <div className="w-full max-w-md">
        <KCard className="flex flex-col items-center gap-4 p-5 text-center sm:p-8">
          <span className="kb-blue flex size-16 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
            <Clock className="size-8" strokeWidth={2.5} aria-hidden />
          </span>
          <h2 className="font-display text-3xl font-bold">Are you still there?</h2>
          <p className="text-[15px] font-medium text-black/70">
            Your session ends in {remainSec} {remainSec === 1 ? 'second' : 'seconds'}. Nothing was charged.
          </p>
          <ProgressBar value={(remainSec / 30) * 100} tone="coral" className="w-full" label="Seconds remaining" />
          <div className="mt-1 flex w-full flex-col gap-3">
            <KButton full className="whitespace-nowrap px-4! text-base!" onClick={() => dispatch({ type: 'IDLE_DISMISS' })}>
              Yes — keep my session
            </KButton>
            <KButton tone="white" icon={LogOut} full className="whitespace-nowrap px-4! text-base!" onClick={() => dispatch({ type: 'RESET' })}>
              No — start over
            </KButton>
          </div>
        </KCard>
      </div>
    </div>
  )
}
