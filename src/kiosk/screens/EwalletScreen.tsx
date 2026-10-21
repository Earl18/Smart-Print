'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Hourglass, Info, Loader2, TriangleAlert, X } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, Money, ProgressBar, StatusPill } from '@/kiosk/components/primitives'
import { PriceSummary } from '@/kiosk/components/PriceSummary'
import { QRPattern } from '@/kiosk/components/QRPattern'
import { formatCountdown } from '@/kiosk/lib/format'
import { WALLET_TIMEOUT_SEC } from '@/kiosk/lib/machine'

const PAYMENT_STEPS = ['Open your e-wallet app', 'Scan this QR code', 'Check the amount, then confirm']

/**
 * E-wallet payment — designed to fit every kiosk viewport (>= 768px tall)
 * on a single screen with no scrolling: the QR sits left while the amount,
 * steps, timer and waiting status share the right side of the same card,
 * and the policy note + cancel action share one compact footer row.
 */
export function EwalletScreen() {
  const { state, dispatch } = useKiosk()
  const { payment } = state

  const awaiting = payment.status === 'awaiting'
  const timePct = Math.max(0, Math.min(100, (payment.deadlineSec / WALLET_TIMEOUT_SEC) * 100))

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-8 sm:py-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">E-wallet payment</h2>
        <p className="mt-1 text-sm font-medium text-black/70 sm:text-base">
          Scan the QR code with GCash, Maya or any supported e-wallet app.
        </p>

        <div className="mt-4 grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-4">
            {/* Main card — QR left, everything else right, so nothing drops below the fold */}
            <KCard className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold sm:text-2xl">Pay with your e-wallet</h3>
                <span className="inline-flex items-center rounded-lg border-[3px] border-black bg-white px-3 py-1 font-mono text-sm font-bold">
                  Ref {payment.reference}
                </span>
              </div>

              {awaiting ? (
                <div className="mt-4 grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
                  {/* QR code */}
                  {payment.qrData ? (
                    <QRPattern
                      data={payment.qrData}
                      className="size-56 justify-self-center sm:justify-self-start"
                      label={`E-wallet payment QR for reference ${payment.reference}`}
                    />
                  ) : (
                    <div className="flex min-h-56 items-center gap-3 font-display text-lg font-bold">
                      <Loader2 className="size-6 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
                      <span>Preparing your payment…</span>
                    </div>
                  )}

                  {/* Amount, steps and timer */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-black/60">Amount to pay</p>
                    <Money value={payment.due} className="text-3xl" />

                    <ol className="mt-3 space-y-2">
                      {PAYMENT_STEPS.map((step, i) => (
                        <li key={step} className="flex items-center gap-2.5">
                          <span className="kb-cream flex size-8 shrink-0 items-center justify-center rounded-lg border-[3px] border-black font-display text-base font-bold">
                            {i + 1}
                          </span>
                          <span className="text-[15px] font-semibold">{step}</span>
                        </li>
                      ))}
                    </ol>

                    <ProgressBar
                      className="mt-3"
                      value={timePct}
                      tone={timePct < 30 ? 'coral' : 'lime'}
                      label="Time remaining to pay"
                    />

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <StatusPill tone="info" icon={Loader2} className="[&>svg]:animate-spin">
                        Waiting for payment…
                      </StatusPill>
                      <p className="font-display text-lg font-bold tabular-nums">
                        {formatCountdown(payment.deadlineSec)} to pay
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </KCard>

            {/* Confirmed */}
            {payment.status === 'confirmed' ? (
              <KCard tone="lime" className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-xl font-bold">Payment confirmed</h3>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[15px] font-semibold">
                  <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
                  <span>Starting your print job…</span>
                </div>
              </KCard>
            ) : null}

            {/* Expired */}
            {payment.status === 'expired' ? (
              <KCard tone="coral" className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Hourglass className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-xl font-bold">Payment expired</h3>
                </div>
                <p className="mt-2 text-[15px] font-semibold">{payment.message}</p>
                <p className="mt-1 text-[15px] font-semibold">No money was charged.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <KButton tone="lime" onClick={() => dispatch({ type: 'PAYMENT_RETRY' })}>
                    Try again
                  </KButton>
                  <KButton tone="white" onClick={() => dispatch({ type: 'PAYMENT_CANCEL' })}>
                    Choose another method
                  </KButton>
                </div>
              </KCard>
            ) : null}

            {/* Failed */}
            {payment.status === 'failed' ? (
              <KCard tone="coral" className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <TriangleAlert className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-xl font-bold">Payment failed</h3>
                </div>
                <p className="mt-2 text-[15px] font-semibold">{payment.message}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <KButton tone="lime" onClick={() => dispatch({ type: 'PAYMENT_RETRY' })}>
                    Try again
                  </KButton>
                  <KButton tone="white" onClick={() => dispatch({ type: 'PAYMENT_CANCEL' })}>
                    Choose another method
                  </KButton>
                </div>
              </KCard>
            ) : null}

            {/* Policy note + cancel action share one row to keep the screen above the fold */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <KCard tone="cream" className="flex flex-1 items-center gap-3 px-4 py-3">
                <Info className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                <p className="text-sm font-semibold">
                  Your e-wallet is charged only after confirmation. Expired or failed payments never charge you.
                </p>
              </KCard>
              {awaiting ? (
                <KButton
                  tone="white"
                  icon={X}
                  className="self-center"
                  onClick={() => dispatch({ type: 'PAYMENT_CANCEL' })}
                >
                  Cancel payment
                </KButton>
              ) : null}
            </div>
          </div>

          <PriceSummary compact className="w-full" />
        </div>
      </motion.div>
    </div>
  )
}
