'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Globe, Loader2, LockKeyhole, RefreshCcw, ShieldCheck, WifiOff } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, StatusPill } from '@/kiosk/components/primitives'
import { DEFAULT_WEBSITE_URL, kioskConfigService } from '@/kiosk/services'
import { cn } from '@/lib/utils'

/**
 * Built-in kiosk browser view for the Smart Print website. Navigation is
 * restricted to the configured site URL only; the site receives ?kiosk=1 so
 * it can hide app-download actions. If the site cannot be reached, a friendly
 * offline message is shown instead.
 */
export function KioskBrowserScreen() {
  const { state, dispatch } = useKiosk()
  const [status, setStatus] = useState<'checking' | 'ready' | 'unreachable'>('checking')
  const [probeTick, setProbeTick] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const { siteUrl, framedUrl } = useMemo(() => {
    const site = kioskConfigService.load()?.websiteUrl ?? DEFAULT_WEBSITE_URL
    return { siteUrl: site, framedUrl: site.includes('?') ? `${site}&kiosk=1` : `${site}?kiosk=1` }
    // Re-read the configured URL whenever the operator retries (or config changes).
  }, [probeTick])

  // While the kiosk is offline there is nothing to probe — derive the state.
  const shown = state.online ? status : 'unreachable'

  /* Reachability probe: the iframe cannot report network failures, so the
     kiosk checks the site itself before embedding it. */
  useEffect(() => {
    if (!state.online) return
    let cancelled = false
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const run = async () => {
      setStatus('checking')
      try {
        await fetch(framedUrl, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
        if (!cancelled) setStatus('ready')
      } catch {
        if (!cancelled) setStatus('unreachable')
      }
    }
    void run()
    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeout)
    }
  }, [framedUrl, state.online, probeTick])

  /* Keep navigation inside the Smart Print site. Same-origin frames get a
     click guard against off-site links and are inspected on every load;
     cross-origin frames are sandboxed (no popups, no top-level navigation). */
  const boundDocRef = useRef<Document | null>(null)
  const onFrameLoad = useCallback(() => {
    const frame = iframeRef.current
    if (!frame) return
    try {
      const sitePrefix = new URL(siteUrl, window.location.origin)
      const allowed = `${sitePrefix.origin}${sitePrefix.pathname}`
      const doc = frame.contentDocument
      if (doc && doc !== boundDocRef.current) {
        boundDocRef.current = doc
        doc.addEventListener(
          'click',
          (e) => {
            const anchor = (e.target as Element | null)?.closest?.('a[href]')
            if (anchor) {
              const href = (anchor as HTMLAnchorElement).href
              if (href && !href.startsWith(allowed)) {
                e.preventDefault()
                e.stopPropagation()
              }
            }
          },
          true,
        )
      }
      const loc = frame.contentWindow?.location
      if (loc?.href && !loc.href.startsWith(allowed)) {
        frame.src = framedUrl
      }
    } catch {
      /* cross-origin frame — the sandbox blocks popups and top navigation */
    }
  }, [siteUrl, framedUrl])

  return (
    <div className="mx-auto flex h-[calc(100dvh-11.5rem)] min-h-[440px] w-full max-w-[1280px] flex-col gap-4 px-4 py-5 sm:h-[calc(100dvh-13rem)] sm:px-8">
      {/* Browser toolbar — Back to kiosk is always visible */}
      <div className="kb-card-flat flex flex-wrap items-center gap-3 p-3 sm:p-4">
        <KButton tone="lime" icon={ArrowLeft} onClick={() => dispatch({ type: 'WEBSITE_CLOSE' })}>
          Back to kiosk
        </KButton>
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border-[3px] border-black bg-kpaper px-3 py-2.5"
          aria-label={`Restricted to ${siteUrl}`}
        >
          <LockKeyhole className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="truncate font-display text-sm font-bold sm:text-base">{siteUrl}</span>
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-lg border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase tracking-wide sm:inline-flex">
            <ShieldCheck className="size-4" strokeWidth={2.5} aria-hidden />
            Site only
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-0 flex-1">
        {shown === 'checking' ? (
          <KCard className="flex h-full items-center justify-center gap-4">
            <Loader2 className="size-8 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
            <p className="font-display text-lg font-bold sm:text-xl">Opening the Smart Print website…</p>
          </KCard>
        ) : null}

        {shown === 'unreachable' ? (
          <KCard tone="coral" className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl border-[3px] border-black bg-white">
              <WifiOff className="size-8" strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">The website can&apos;t be reached</h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] font-semibold">
                The Smart Print website is not responding right now. Printing at the kiosk still works —
                press <strong>Back to kiosk</strong> to return.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <KButton tone="white" icon={RefreshCcw} onClick={() => setProbeTick((t) => t + 1)}>
                Try again
              </KButton>
              <KButton tone="lime" icon={ArrowLeft} onClick={() => dispatch({ type: 'WEBSITE_CLOSE' })}>
                Back to kiosk
              </KButton>
            </div>
          </KCard>
        ) : null}

        <iframe
          ref={iframeRef}
          src={framedUrl}
          onLoad={onFrameLoad}
          title="Smart Print website"
          sandbox="allow-scripts allow-forms allow-same-origin"
          referrerPolicy="no-referrer"
          className={cn(
            'size-full rounded-2xl border-[3px] border-black bg-white shadow-[5px_5px_0_#000]',
            shown === 'ready' ? 'block' : 'hidden',
          )}
        />
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-black/45">
        <Globe className="size-4" aria-hidden />
        Only the Smart Print website can be opened from the kiosk.
        {state.online ? null : <StatusPill tone="error" icon={WifiOff}>Offline</StatusPill>}
      </p>
    </div>
  )
}
