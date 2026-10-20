'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Banknote,
  Bluetooth,
  CheckCircle2,
  History,
  Info,
  Paperclip,
  QrCode,
  ShieldCheck,
  TriangleAlert,
  Usb,
} from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { Chip, KButton, KCard, Notice, SectionHeading, StatusPill } from '@/kiosk/components/primitives'

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

export function WelcomeScreen() {
  const { state, dispatch } = useKiosk()

  return (
    <div className="mx-auto grid w-full max-w-[1280px] items-center gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr]">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-start gap-6"
        >
          {/* Mascot sticker — decorative, slightly rotated */}
          <div
            aria-hidden
            className="kb-lime size-36 rotate-[-2deg] overflow-hidden rounded-full border-[3px] border-black shadow-[6px_6px_0_#000] sm:size-48"
          >
            <img src="/mascot.png" alt="" className="size-full object-cover" />
          </div>

          <SectionHeading sub="Send a file from your phone or USB drive, pick your options, pay, and collect your prints — no app needed.">
            Print anything.
            <br />
            Right here, right now.
          </SectionHeading>

          <div className="flex w-full flex-col gap-4">
            <KButton
              size="xl"
              icon={ArrowRight}
              className="self-start"
              onClick={() => {
                requestFullscreenIfPossible()
                dispatch({ type: 'START_ORDER' })
              }}
            >
              Start printing
            </KButton>

            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-black/60">Send files from</p>
              <div className="flex flex-wrap gap-2.5">
                <Chip icon={QrCode}>QR code</Chip>
                <Chip icon={Bluetooth}>Bluetooth</Chip>
                <Chip icon={Usb}>USB drive</Chip>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {state.printer.ready && state.printer.paper !== 'out' ? (
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

            {state.notice ? (
              <Notice icon={Info}>{state.notice}</Notice>
            ) : null}
          </div>
        </motion.div>
      </div>

      <KCard className="w-full">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Today at this kiosk</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3">
            <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
              <Banknote className="size-5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold">
              Cash and e-wallet accepted · exact amount appreciated
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
              <Paperclip className="size-5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold">A4, Letter and A3 · black & white or colored</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
              <ShieldCheck className="size-5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold">Your file is deleted from the kiosk after printing</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
              <CheckCircle2 className="size-5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold">
              {state.printer.ready && state.printer.paper !== 'out'
                ? state.printer.message
                : state.printer.message}
            </span>
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
