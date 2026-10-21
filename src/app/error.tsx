'use client'

import { useEffect } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { KioskLogo } from '@/kiosk/components/Logo'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the failure for kiosk operators watching the logs.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-kpaper px-4 py-16 text-center">
      <KioskLogo className="size-24 sm:size-28" alt="" />
      <span className="inline-flex items-center gap-2 rounded-lg border-[3px] border-black bg-kcoral px-3 py-1.5 text-sm font-bold">
        <TriangleAlert className="size-5" strokeWidth={2.5} aria-hidden />
        Something went wrong
      </span>
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">This page hit a paper jam</h1>
        <p className="mx-auto mt-2 max-w-md font-semibold text-black/60">
          An unexpected error stopped this page. Trying again usually clears it — your kiosk and its saved
          transactions are unaffected.
        </p>
      </div>
      <button type="button" onClick={reset} className="kb-btn kb-btn-lime">
        <RotateCcw className="size-5" strokeWidth={2.5} aria-hidden />
        Try again
      </button>
    </div>
  )
}
