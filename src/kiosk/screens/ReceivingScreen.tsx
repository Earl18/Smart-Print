'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Files,
  FileWarning,
  Hourglass,
  Image,
  Loader2,
  TriangleAlert,
  Usb,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useKiosk } from '@/kiosk/KioskContext'
import { QRPattern } from '@/kiosk/components/QRPattern'
import {
  DashedDivider,
  KButton,
  KCard,
  ProgressBar,
  SectionHeading,
  StatusPill,
} from '@/kiosk/components/primitives'
import { formatBytes, formatCountdown } from '@/kiosk/lib/format'
import type { DocKind, FileSource } from '@/kiosk/lib/types'

const HEADINGS: Record<FileSource, { title: string; sub: string }> = {
  qr: { title: 'Scan the QR code', sub: 'Upload from your phone in three steps.' },
  bluetooth: { title: 'Send over Bluetooth', sub: 'Pair your device and send the file.' },
  usb: { title: 'Choose a file', sub: 'Pick a document from your USB drive.' },
}

/** Shown before the intake service reports its first status message. */
const WAITING_MESSAGE: Record<FileSource, string> = {
  qr: 'Waiting for your upload…',
  bluetooth: 'Waiting for your Bluetooth transfer…',
  usb: 'Waiting for a USB drive…',
}

const KIND_ICON: Record<DocKind, LucideIcon> = {
  pdf: FileText,
  image: Image,
  document: Files,
  unknown: FileWarning,
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="kb-lime flex size-9 shrink-0 items-center justify-center rounded-lg border-[3px] border-black font-display text-sm font-bold">
        {n}
      </span>
      <span className="text-[15px] font-semibold">{children}</span>
    </li>
  )
}

export function ReceivingScreen() {
  const { state, dispatch } = useKiosk()
  const source: FileSource = state.source ?? 'qr'
  const intake = state.intake
  const heading = HEADINGS[source]
  const uploadUrl = `smartprint.ph/u/${state.payment.orderRef || 'SP'}`
  const live =
    intake.status === 'waiting' ||
    intake.status === 'reading' ||
    intake.status === 'ready' ||
    intake.status === 'receiving'
  const failed = intake.status === 'timeout' || intake.status === 'error'
  const message = intake.message || WAITING_MESSAGE[source]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-5 sm:gap-6"
      >
        <SectionHeading sub={heading.sub}>{heading.title}</SectionHeading>

        {/* ---------- variant ---------- */}
        {source === 'qr' ? (
          <div className="flex flex-col items-center gap-5 sm:gap-6">
            <QRPattern data={uploadUrl} label="Upload QR code" className="size-56 sm:size-72" />
            <KCard className="w-full max-w-md">
              <ol className="space-y-3">
                <Step n={1}>Point your phone camera at the QR code</Step>
                <Step n={2}>Upload your file on the page that opens</Step>
                <Step n={3}>Keep this screen open until the upload finishes</Step>
              </ol>
              <p className="kb-cream mt-5 break-all rounded-xl border-[3px] border-black px-3 py-2 font-mono text-sm font-bold">
                {uploadUrl}
              </p>
            </KCard>
          </div>
        ) : source === 'bluetooth' ? (
          <KCard className="mx-auto w-full max-w-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-black/60">Device name</p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">SMARTPRINT-KIOSK-01</p>
            <DashedDivider />
            <ol className="space-y-3">
              <Step n={1}>Turn on Bluetooth on your device</Step>
              <Step n={2}>Pair with SMARTPRINT-KIOSK-01 — no PIN needed</Step>
              <Step n={3}>Send your document to the kiosk</Step>
              <Step n={4}>Wait for the progress bar below</Step>
            </ol>
          </KCard>
        ) : intake.status === 'reading' ? (
          <div className="kb-card-flat flex flex-col items-center gap-3 px-6 py-10 text-center">
            <Loader2 className="size-10 animate-spin" strokeWidth={2.5} aria-hidden />
            <p className="font-display text-lg font-bold sm:text-xl">Reading the USB drive…</p>
          </div>
        ) : intake.status === 'ready' ? (
          intake.usbFiles.length > 0 ? (
            <div className="flex flex-col gap-3" aria-label="Files on the USB drive">
              {intake.usbFiles.map((file) => {
                const FileIcon = KIND_ICON[file.kind]
                return (
                  <button
                    key={file.name}
                    type="button"
                    className="kb-chip w-full justify-between! gap-3!"
                    onClick={() => dispatch({ type: 'INTAKE_PICK_FILE', fileName: file.name })}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <FileIcon className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                      <span className="truncate font-display text-base font-bold sm:text-lg">{file.name}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-black/60">{formatBytes(file.sizeBytes)}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="kb-card-flat flex flex-col items-center gap-3 px-6 py-10 text-center">
              <FileWarning className="size-10" strokeWidth={2.5} aria-hidden />
              <p className="font-display text-lg font-bold sm:text-xl">No readable files were found on this drive.</p>
              <p className="text-sm font-semibold text-black/70">Try a different USB drive or send the file another way.</p>
            </div>
          )
        ) : intake.status === 'waiting' ? (
          <div className="kb-dashed flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-10 text-center">
            <span className="kb-cream flex size-16 items-center justify-center rounded-2xl border-[3px] border-black">
              <Usb className="size-8" strokeWidth={2.5} aria-hidden />
            </span>
            <p className="font-display text-lg font-bold sm:text-xl">
              Insert your USB drive into the port below the screen.
            </p>
          </div>
        ) : null}

        {/* ---------- live transfer status ---------- */}
        {live ? (
          <KCard className="w-full">
            {intake.status === 'receiving' ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-xl font-bold sm:text-2xl">
                    Receiving… {Math.round(intake.progress)}%
                  </p>
                  <p className="text-sm font-bold">Time left {formatCountdown(intake.timeoutSec)}</p>
                </div>
                <ProgressBar value={intake.progress} className="mt-3" label="Receiving file" />
                <p className="mt-3 text-[15px] font-semibold text-black/70">{message}</p>
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusPill tone="info" icon={Loader2} className="[&>svg]:animate-spin">
                  {message}
                </StatusPill>
                <p className="text-sm font-bold">Time left {formatCountdown(intake.timeoutSec)}</p>
              </div>
            )}
          </KCard>
        ) : null}

        {/* ---------- timeout / error ---------- */}
        {failed ? (
          <KCard tone="coral" className="w-full">
            <div className="flex flex-col gap-4">
              <StatusPill tone="error" icon={intake.status === 'timeout' ? Hourglass : TriangleAlert}>
                {intake.status === 'timeout' ? 'Timed out' : 'Transfer failed'}
              </StatusPill>
              <p className="text-base font-bold sm:text-lg">{intake.message}</p>
              <p className="text-[15px] font-semibold text-black/70">
                Nothing was charged — you have not paid yet.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <KButton
                  tone="lime"
                  className="w-full sm:flex-1"
                  onClick={() => dispatch({ type: 'PICK_SOURCE', source })}
                >
                  Try again
                </KButton>
                <KButton
                  tone="white"
                  className="w-full sm:flex-1"
                  onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}
                >
                  Choose another way
                </KButton>
              </div>
            </div>
          </KCard>
        ) : (
          <div>
            <KButton tone="white" onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}>
              Cancel
            </KButton>
          </div>
        )}
      </motion.div>
    </div>
  )
}
