'use client'

import { motion } from 'framer-motion'
import {
  Bluetooth,
  FileText,
  Files,
  FileWarning,
  Hourglass,
  Image,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  Usb,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useKiosk } from '@/kiosk/KioskContext'
import {
  IconBadge,
  KButton,
  KCard,
  ProgressBar,
  SectionHeading,
  StatusPill,
} from '@/kiosk/components/primitives'
import { formatBytes, formatCountdown } from '@/kiosk/lib/format'
import type { DocKind, FileSource } from '@/kiosk/lib/types'

const HEADINGS: Record<FileSource, { title: string; sub: string }> = {
  qr: { title: 'Scan the QR code', sub: 'Send a demo file from your phone in three steps.' },
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

function QrReceivingScreen() {
  const { state, dispatch } = useKiosk()
  const intake = state.intake
  const [uploadOrigin, setUploadOrigin] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/upload/address')
      .then((response) => response.json())
      .then((data: { origin?: string }) => {
        if (active) setUploadOrigin(data.origin || window.location.origin)
      })
      .catch(() => {
        if (active) setUploadOrigin(window.location.origin)
      })
    return () => { active = false }
  }, [])

  const uploadUrl = uploadOrigin && state.payment.orderRef
    ? `${uploadOrigin}/upload/${encodeURIComponent(state.payment.orderRef)}`
    : ''
  const failed = intake.status === 'timeout' || intake.status === 'error'
  const receiving = intake.status === 'receiving'
  const message = intake.message || WAITING_MESSAGE.qr

  return (
    <div className="qr-page mx-auto flex w-full max-w-5xl flex-col justify-center px-3 py-2 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="qr-page-content flex w-full flex-col gap-4"
      >
        <SectionHeading className="qr-page-heading" sub="Send a demo document from your phone in three steps.">
          Scan the QR code
        </SectionHeading>
        <div className="qr-page-grid grid items-center gap-4 min-[560px]:grid-cols-2 min-[800px]:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] min-[800px]:gap-10">
          <div className="flex min-w-0 justify-center">
            <div className="kb-card-flat bg-white p-3">
              {uploadUrl ? (
                <QRCodeSVG value={uploadUrl} size={384} level="M" role="img" aria-label="Upload QR code" className="qr-page-code" />
              ) : (
                <div className="qr-page-code animate-pulse bg-black/10" />
              )}
            </div>
          </div>

          <div className="qr-page-right flex min-w-0 flex-col gap-4">
          {failed ? (
            <KCard tone="coral" className="w-full">
              <StatusPill tone="error" icon={intake.status === 'timeout' ? Hourglass : TriangleAlert}>
                {intake.status === 'timeout' ? 'Timed out' : 'Transfer failed'}
              </StatusPill>
              <p className="mt-3 text-sm font-semibold">{intake.message}</p>
              <p className="mt-1 text-xs font-medium">Nothing was charged.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <KButton tone="lime" className="min-h-12! px-2! text-sm!" onClick={() => dispatch({ type: 'PICK_SOURCE', source: 'qr' })}>Try again</KButton>
                <KButton tone="white" className="min-h-12! px-2! text-sm!" onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}>Other method</KButton>
              </div>
            </KCard>
          ) : (
            <>
              <KCard className="qr-page-steps w-full">
                <ol className="space-y-3">
                  <Step n={1}>Point your phone camera at the QR code</Step>
                  <Step n={2}>Tap Send demo to kiosk on the phone page</Step>
                  <Step n={3}>Keep this screen open until the demo arrives</Step>
                </ol>
                <p className="kb-cream mt-5 break-all rounded-xl border-[3px] border-black px-3 py-2 font-mono text-xs font-bold">
                  {uploadUrl || 'Preparing upload link…'}
                </p>
              </KCard>

              <KCard className="qr-page-status flex w-full min-w-0 items-center justify-between gap-2">
                {receiving ? (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">Receiving… {Math.round(intake.progress)}%</p>
                    <ProgressBar value={intake.progress} label="Receiving file" className="mt-1" />
                  </div>
                ) : (
                  <StatusPill tone="info" icon={Loader2} className="min-w-0 [&>svg]:animate-spin">
                    {message}
                  </StatusPill>
                )}
                <p className="shrink-0 text-sm font-bold"><span className="qr-time-label">Time left </span>{formatCountdown(intake.timeoutSec)}</p>
              </KCard>

              <KButton tone="white" className="qr-page-cancel" onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}>
                Cancel
              </KButton>
            </>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function BluetoothReceivingScreen() {
  const { state, dispatch } = useKiosk()
  const intake = state.intake
  const live = ['waiting', 'reading', 'ready', 'receiving'].includes(intake.status)
  const failed = intake.status === 'timeout' || intake.status === 'error'
  const message = intake.message || WAITING_MESSAGE.bluetooth

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-5 sm:gap-6"
      >
        <SectionHeading sub={HEADINGS.bluetooth.sub}>{HEADINGS.bluetooth.title}</SectionHeading>

        <div className="grid items-center gap-5 min-[560px]:grid-cols-2 sm:gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,28rem)] lg:justify-center lg:gap-10">
          <KCard className="flex w-full min-w-0 flex-col items-center py-10 text-center">
            <IconBadge icon={Bluetooth} tone="blue" size="lg" rotate={-3} />
            <p className="mt-6 text-sm font-bold uppercase tracking-wide text-black/60">Device name</p>
            <p className="mt-1 break-all font-display text-xl font-bold tracking-tight lg:text-2xl">SMARTPRINT-KIOSK-01</p>
            <StatusPill tone="warn" icon={ShieldCheck} className="mt-6 justify-center text-center">
              Pairing open — no PIN needed
            </StatusPill>
          </KCard>

          <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
            <KCard className="w-full">
              <ol className="space-y-3">
                <Step n={1}>Turn on Bluetooth on your device</Step>
                <Step n={2}>Pair with SMARTPRINT-KIOSK-01</Step>
                <Step n={3}>Send your document to the kiosk</Step>
                <Step n={4}>Wait for the progress bar below</Step>
              </ol>
            </KCard>

            {live ? (
              <KCard className="w-full">
                {intake.status === 'receiving' ? (
                  <>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-xl font-bold sm:text-2xl">Receiving… {Math.round(intake.progress)}%</p>
                      <p className="text-sm font-bold">Time left {formatCountdown(intake.timeoutSec)}</p>
                    </div>
                    <ProgressBar value={intake.progress} className="mt-3" label="Receiving file" />
                    <p className="mt-3 text-[15px] font-semibold text-black/70">{message}</p>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StatusPill tone="info" icon={Loader2} className="[&>svg]:animate-spin">{message}</StatusPill>
                    <p className="text-sm font-bold">Time left {formatCountdown(intake.timeoutSec)}</p>
                  </div>
                )}
              </KCard>
            ) : null}

            {failed ? (
              <KCard tone="coral" className="w-full">
                <div className="flex flex-col gap-4">
                  <StatusPill tone="error" icon={intake.status === 'timeout' ? Hourglass : TriangleAlert}>
                    {intake.status === 'timeout' ? 'Timed out' : 'Transfer failed'}
                  </StatusPill>
                  <p className="text-base font-bold sm:text-lg">{intake.message}</p>
                  <p className="text-[15px] font-semibold text-black/70">Nothing was charged — you have not paid yet.</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <KButton tone="lime" className="w-full sm:flex-1" onClick={() => dispatch({ type: 'PICK_SOURCE', source: 'bluetooth' })}>
                      Try again
                    </KButton>
                    <KButton tone="white" className="w-full sm:flex-1" onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}>
                      Choose another way
                    </KButton>
                  </div>
                </div>
              </KCard>
            ) : (
              <KButton tone="white" full onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}>Cancel</KButton>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function ReceivingScreen() {
  const { state, dispatch } = useKiosk()
  const source: FileSource = state.source ?? 'qr'
  if (source === 'qr') return <QrReceivingScreen />
  if (source === 'bluetooth') return <BluetoothReceivingScreen />
  const intake = state.intake
  const heading = HEADINGS[source]
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
        {intake.status === 'reading' ? (
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
            <KButton tone="white" full={source === 'usb'} onClick={() => dispatch({ type: 'INTAKE_CANCEL' })}>
              Cancel
            </KButton>
          </div>
        )}
      </motion.div>
    </div>
  )
}
