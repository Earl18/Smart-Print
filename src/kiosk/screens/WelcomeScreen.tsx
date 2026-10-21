'use client'

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
  { icon: QrCode, tone: 'kb-blue', title: 'QR code', hint: 'Scan with your phone camera' },
  { icon: Bluetooth, tone: 'kb-lime', title: 'Bluetooth', hint: 'Send wirelessly, no cables' },
  { icon: Usb, tone: 'kb-coral', title: 'USB drive', hint: 'Plug in your flash drive' },
] as const

const TODAY_ROWS = [
  { icon: Banknote, tone: 'kb-lime', text: 'Cash and e-wallet accepted · exact amount appreciated' },
  { icon: Paperclip, tone: 'kb-blue', text: 'A4, Letter and A3 · black & white or colored' },
  { icon: ShieldCheck, tone: 'kb-coral', text: 'Your file is deleted from the kiosk after printing' },
] as const

export function WelcomeScreen() {
  const { state, dispatch } = useKiosk()
  const printerOk = state.printer.ready && state.printer.paper !== 'out'

  return (
    <div className="mx-auto grid w-full max-w-[1280px] items-center gap-8 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-start gap-6 sm:gap-7"
      >
        {/* Brand eyebrow — typographic mark in place of the logo */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-3.5 rounded-full border-2 border-black bg-klime" />
            <span className="size-3.5 rounded-full border-2 border-black bg-kcoral" />
            <span className="size-3.5 rounded-full border-2 border-black bg-kblue" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-black/60 sm:text-sm">
            Smart Print · Self-service printing
          </span>
        </div>

        {/* Hero headline — carries the brand now that the mark is gone */}
        <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
          Print anything.
          <br />
          <span className="mt-3 inline-block rounded-2xl border-[3px] border-black bg-klime px-3 pb-1.5 shadow-[5px_5px_0_#000] sm:mt-4 sm:px-5 sm:pb-2.5">
            Right here, right now.
          </span>
        </h1>
        <p className="-mt-1 max-w-xl text-base font-medium text-black/70 sm:text-lg">
          Send a file from your phone or USB drive, pick your options, pay, and collect your prints — no app
          needed.
        </p>

        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <KButton
              size="xl"
              icon={ArrowRight}
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
                icon={Globe}
                onClick={() => {
                  window.location.href = '/?from=kiosk'
                }}
              >
                Visit Smart Print website
              </KButton>
            ) : null}
          </div>

          <div className="w-full">
            <p className="mb-2.5 text-sm font-bold uppercase tracking-wide text-black/60">Send files from</p>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {SEND_FROM_TILES.map(({ icon: Icon, tone, title, hint }) => (
                <div key={title} className="kb-card-flat flex items-center gap-3 p-3 sm:flex-col sm:items-start sm:gap-2.5 sm:p-4">
                  <span
                    className={`${tone} flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black shadow-[3px_3px_0_#000]`}
                  >
                    <Icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-bold leading-tight sm:text-lg">{title}</span>
                    <span className="block text-sm font-medium leading-snug text-black/60">{hint}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {printerOk ? (
              <StatusPill tone="ok" icon={CheckCircle2}>
                Ready to print now
              </StatusPill>
            ) : (
              <StatusPill tone="error" icon={TriangleAlert}>
                Printer needs attention
              </StatusPill>
            )}
            <StatusPill tone="info" icon={Banknote}>
              From ₱5 per page
            </StatusPill>
          </div>

          {state.notice ? <Notice icon={Info}>{state.notice}</Notice> : null}
        </div>
      </motion.div>

      <KCard className="w-full">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Today at this kiosk</h2>
        <ul className="mt-4 space-y-3">
          {TODAY_ROWS.map(({ icon: Icon, tone, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span
                className={`${tone} flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black shadow-[3px_3px_0_#000]`}
              >
                <Icon className="size-5" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-[15px] font-semibold">{text}</span>
            </li>
          ))}
          <li className="flex items-center gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black shadow-[3px_3px_0_#000] ${
                printerOk ? 'kb-lime' : 'kb-coral'
              }`}
            >
              {printerOk ? (
                <CheckCircle2 className="size-5" strokeWidth={2.5} aria-hidden />
              ) : (
                <TriangleAlert className="size-5" strokeWidth={2.5} aria-hidden />
              )}
            </span>
            <span className="text-[15px] font-semibold">{state.printer.message}</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => dispatch({ type: 'OPEN_RECOVERY' })}
          className="mt-6 inline-flex min-h-16 items-center gap-2 font-display text-base font-bold underline decoration-[3px] underline-offset-4 hover:bg-klime focus-visible:outline-[3px]"
        >
          <History className="size-5" strokeWidth={2.5} aria-hidden />
          Recover previous transaction
        </button>
      </KCard>
    </div>
  )
}
