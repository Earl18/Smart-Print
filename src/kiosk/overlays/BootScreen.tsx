'use client'

import { Loader2, Printer } from 'lucide-react'
import { KCard } from '@/kiosk/components/primitives'

export function BootScreen() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <KCard className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center" aria-live="polite">
        <span className="kb-lime flex size-16 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
          <Printer className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="font-display text-2xl font-bold">Starting Smart Print</h1>
        <p className="text-[15px] font-medium text-black/70">
          Checking the printer, network connection and kiosk license…
        </p>
        <Loader2 className="size-8 animate-spin" strokeWidth={2.5} aria-hidden />
      </KCard>
    </div>
  )
}
