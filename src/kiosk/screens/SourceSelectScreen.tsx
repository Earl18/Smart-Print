'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Bluetooth, QrCode, Smartphone, Usb, WifiOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, SectionHeading, StatusPill } from '@/kiosk/components/primitives'
import type { FileSource } from '@/kiosk/lib/types'

/* kb-* classes in kiosk.css are unlayered CSS, so Tailwind utilities that must
   override them (align/justify, padding, min-height, …) carry the `!` modifier. */

interface SourceOption {
  source: FileSource
  title: string
  blurb: string
  icon: LucideIcon
  tileTone: string
}

const SOURCES: SourceOption[] = [
  { source: 'qr', title: 'QR code', blurb: 'Scan & upload from your phone', icon: QrCode, tileTone: 'kb-lime' },
  {
    source: 'bluetooth',
    title: 'Bluetooth',
    blurb: 'Send from your laptop, no cables',
    icon: Bluetooth,
    tileTone: 'kb-blue',
  },
  { source: 'usb', title: 'USB drive', blurb: 'Plug in and pick your file', icon: Usb, tileTone: 'bg-white' },
]

export function SourceSelectScreen() {
  const { state, dispatch } = useKiosk()
  const router = useRouter()

  /* Tapping the QR card opens the phone upload page for this transaction —
     the same page a phone opens after scanning the code. The kiosk keeps
     its session, and the file lands in the document scan step on return. */
  const openUploadPage = () => {
    dispatch({ type: 'PICK_SOURCE', source: 'qr' })
    const sessionId = state.payment.orderRef || 'SP-TEMP'
    router.push(`/upload/${encodeURIComponent(sessionId)}?from=kiosk`)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-6"
      >
        <SectionHeading sub="Pick how you want to get your document into this kiosk.">Send us your file</SectionHeading>

        <div className="grid gap-4 sm:grid-cols-3">
          {SOURCES.map(({ source, title, blurb, icon: Icon, tileTone }) => {
            const needsInternet = source === 'qr' && !state.online
            return (
              <button
                key={source}
                type="button"
                disabled={needsInternet}
                onClick={() => {
                  if (source === 'qr') {
                    openUploadPage()
                    return
                  }
                  dispatch({ type: 'PICK_SOURCE', source })
                }}
                className="kb-chip w-full flex-col items-start! justify-start! gap-3! min-h-[190px]! p-5! rounded-2xl!"
              >
                <span
                  className={cn(
                    'flex size-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black',
                    tileTone,
                  )}
                >
                  <Icon className="size-7" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-display text-xl font-bold sm:text-2xl">{title}</span>
                <span className="text-[15px] font-semibold text-black/70">{blurb}</span>
                {source === 'qr' && !needsInternet ? (
                  <span className="mt-auto flex items-center gap-2 pt-2 text-sm font-bold text-black/70">
                    <Smartphone className="size-4" strokeWidth={2.5} aria-hidden />
                    Tap to open the upload page
                  </span>
                ) : null}
                {needsInternet ? (
                  <span className="mt-auto flex flex-col items-start gap-2.5 pt-2">
                    <StatusPill tone="error" icon={WifiOff}>
                      Needs internet
                    </StatusPill>
                    <span className="text-sm font-semibold text-black/70">
                      QR upload needs an internet connection.
                    </span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div>
          <KButton tone="white" onClick={() => dispatch({ type: 'PREFS_BACK' })}>
            Back to preferences
          </KButton>
        </div>
      </motion.div>
    </div>
  )
}
