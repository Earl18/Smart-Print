'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  Bluetooth,
  CheckCircle2,
  Globe,
  History,
  Info,
  Paperclip,
  QrCode,
  ShieldCheck,
  TriangleAlert,
  Usb,
} from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, Notice, StatusPill } from '@/kiosk/components/primitives'
import { IDLE_EXPIRED_NOTICE } from '@/kiosk/lib/machine'

declare global {
  interface Window {
    kiosk?: { isElectron?: boolean }
  }
}

function requestFullscreenIfPossible() {
  // The desktop shell runs permanently fullscreen; only the browser
  // preview needs a gesture to enter fullscreen.
  if (typeof window !== 'undefined' && window.kiosk?.isElectron) return
  const el = document.documentElement
  if (!document.fullscreenElement && el.requestFullscreen) {
    el.requestFullscreen().catch(() => {
      /* preview iframes may deny fullscreen — the kiosk still works */
    })
  }
}

const SEND_FROM_TILES = [
  { icon: QrCode, tone: 'kb-blue', title: 'QR code', hint: 'Scan with your phone' },
  { icon: Bluetooth, tone: 'kb-lime', title: 'Bluetooth', hint: 'Send wirelessly, no cables' },
  { icon: Usb, tone: 'kb-coral', title: 'USB drive', hint: 'Plug in your flash drive' },
] as const

const TODAY_ROWS = [
  { icon: Banknote, tone: 'kb-lime', text: 'Cash and e-wallet accepted · exact amount appreciated' },
  { icon: Paperclip, tone: 'kb-blue', text: 'A4, Letter and A3 · black & white or colored' },
  { icon: ShieldCheck, tone: 'kb-coral', text: 'Your file is deleted from the kiosk after printing' },
] as const

/**
 * Welcome screen — designed to fit every kiosk viewport (>= 768px tall)
 * on a single screen with no scrolling: viewport-scaled headline,
 * compact vertical rhythm and one-glance info card.
 */
export function WelcomeScreen() {
  const { state, dispatch } = useKiosk()
  const printerOk = state.printer.ready && state.printer.paper !== 'out'

  useEffect(() => {
    if (state.notice !== IDLE_EXPIRED_NOTICE) return
    const timer = window.setTimeout(() => dispatch({ type: 'NOTICE', message: null }), 5000)
    return () => window.clearTimeout(timer)
  }, [state.notice, dispatch])

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1280px] content-center items-center gap-6 px-4 py-5 sm:min-h-[calc(100dvh-5rem)] sm:px-8 sm:py-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-start gap-4"
      >
        {/* Brand eyebrow — typographic mark in place of the logo */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-3 rounded-full border-2 border-black bg-klime" />
            <span className="size-3 rounded-full border-2 border-black bg-kcoral" />
            <span className="size-3 rounded-full border-2 border-black bg-kblue" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-black/60">
            Smart Print · Self-service printing
          </span>
        </div>

        {/* Hero headline — viewport-scaled so the sticker line never wraps
            into a tall block on mid-size kiosk panels */}
        <h1 className="font-display text-[length:clamp(2.25rem,4.2vw,3.75rem)] font-bold leading-[1.08] tracking-tight">
          Print anything.
          <br />
          <span className="mt-1.5 inline-block rounded-2xl border-[3px] border-black bg-klime px-3 pb-1 shadow-[5px_5px_0_#000] sm:px-4">
            Right here, right now.
          </span>
        </h1>
        <p className="-mt-1 max-w-xl text-base font-medium text-black/70">
          Send a file from your phone or USB drive, pick your options, pay, and collect your prints — no app
          needed.
        </p>

        <div className="flex w-full flex-col gap-3.5 sm:gap-4">
          {/* Give the primary action more space while keeping both actions in one row on wide screens. */}
          <div className={`grid w-full gap-2.5 ${state.online ? 'lg:grid-cols-[1.2fr_1fr]' : ''}`}>
            <KButton
              size="lg"
              icon={ArrowRight}
              full
              className="px-6! text-center"
              onClick={() => {
                requestFullscreenIfPossible()
                dispatch({ type: 'START_ORDER' })
              }}
            >
              Start printing
            </KButton>

            {state.online ? (
              <KButton
                tone="white"
                size="md"
                icon={Globe}
                full
                className="px-5! text-center"
                onClick={() => {
                  window.location.href = '/?from=kiosk'
                }}
              >
                Visit Smart Print website
              </KButton>
            ) : null}
          </div>

          <div className="w-full">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-black/60">Send files from</p>
            <div className="grid w-full grid-cols-3 gap-2.5 max-[479px]:grid-cols-1 sm:gap-3">
              {SEND_FROM_TILES.map(({ icon: Icon, tone, title, hint }) => (
                <div key={title} className="kb-card-flat flex items-center gap-2.5 p-2.5">
                  <span
                    className={`${tone} flex size-9 shrink-0 items-center justify-center rounded-lg border-[3px] border-black shadow-[3px_3px_0_#000]`}
                  >
                    <Icon className="size-5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-bold leading-tight">{title}</span>
                    <span className="block text-[11px] font-medium leading-snug text-black/60">{hint}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
              {printerOk ? (
                <StatusPill tone="ok" icon={CheckCircle2} className="justify-center text-center">
                  Ready to print now
                </StatusPill>
              ) : (
                <StatusPill tone="error" icon={TriangleAlert} className="justify-center text-center">
                  Printer needs attention
                </StatusPill>
              )}
              <StatusPill tone="info" icon={Banknote} className="justify-center text-center">
                From ₱5 per page
              </StatusPill>
            </div>
          </div>

          {state.notice ? <Notice icon={Info}>{state.notice}</Notice> : null}
        </div>
      </motion.div>

      <KCard className="w-full p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold">Today at this kiosk</h2>
        <ul className="mt-2.5 space-y-2">
          {TODAY_ROWS.map(({ icon: Icon, tone, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className={`${tone} flex size-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-black shadow-[3px_3px_0_#000]`}
              >
                <Icon className="size-5" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-[15px] font-semibold leading-snug">{text}</span>
            </li>
          ))}
          <li className="hidden items-center gap-3 lg:flex">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-[3px] border-black shadow-[3px_3px_0_#000] ${
                printerOk ? 'kb-lime' : 'kb-coral'
              }`}
            >
              {printerOk ? (
                <CheckCircle2 className="size-5" strokeWidth={2.5} aria-hidden />
              ) : (
                <TriangleAlert className="size-5" strokeWidth={2.5} aria-hidden />
              )}
            </span>
            <span className="text-[15px] font-semibold leading-snug">{state.printer.message}</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => dispatch({ type: 'OPEN_RECOVERY' })}
          className="mt-4 inline-flex min-h-16 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 text-center font-display text-base font-bold shadow-[3px_3px_0_#000] transition-[background-color,transform,box-shadow] duration-100 ease-out hover:-translate-y-0.5 hover:bg-klime hover:shadow-[5px_5px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:bg-klime active:shadow-[1px_1px_0_#000] focus-visible:outline-[3px]"
        >
          <History className="size-5" strokeWidth={2.5} aria-hidden />
          Recover previous transaction
        </button>
      </KCard>
    </div>
  )
}
