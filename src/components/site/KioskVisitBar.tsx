'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { ExternalLink } from 'lucide-react'

const FLAG = 'sp.fromKiosk'

const emptySubscribe = () => () => {}

/** Slim banner shown on public pages when the visit came from the kiosk
    (?from=kiosk): "You're viewing the Smart Print website — Back to kiosk".
    The flag sticks for the browsing session so following links keep the bar. */
export function KioskVisitBar() {
  const params = useSearchParams()
  const fromKiosk = params.get('from') === 'kiosk'

  // Read after mount only (useSyncExternalStore), so SSR never mismatches.
  const stored = useSyncExternalStore(
    emptySubscribe,
    () => sessionStorage.getItem(FLAG) === '1',
    () => false,
  )

  useEffect(() => {
    if (fromKiosk) sessionStorage.setItem(FLAG, '1')
  }, [fromKiosk])

  if (!fromKiosk && !stored) return null

  return (
    <div className="border-b-[3px] border-black bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs font-bold sm:text-sm">
        <span className="uppercase tracking-wide">You&apos;re viewing the Smart Print website</span>
        <Link
          href="/kiosk"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border-2 border-white bg-klime px-2.5 py-0.5 font-display text-xs font-bold text-black sm:text-sm"
        >
          <ExternalLink className="size-3.5" strokeWidth={2.5} aria-hidden />
          Back to kiosk
        </Link>
      </div>
    </div>
  )
}
