'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Hourglass, Info, Loader2, TriangleAlert, X } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, KeyVal, Money, ProgressBar } from '@/kiosk/components/primitives'
import { PriceSummary } from '@/kiosk/components/PriceSummary'
import { formatCountdown, formatPeso } from '@/kiosk/lib/format'
import { CASH_TIMEOUT_SEC } from '@/kiosk/lib/machine'

/** Bill denominations accepted by the kiosk's cash acceptor. */
const CASH_DENOMINATIONS = [20, 50, 100, 200, 500, 1000]

/**
 * Cash payment — fits every kiosk viewport (>= 768px tall) on a single
 * screen: the amount due and accepted bills sit left while the live
 * received/remaining counters, timer and guidance share the right side
 * of the same card. The payment notice and cancel action sit directly
 * below the cash card.
 */
export function CashScreen() {
  const { state, dispatch } = useKiosk()
  const { payment } = state

  const awaiting = payment.status === 'awaiting'
  const collecting = awaiting && payment.received < payment.due
  const remaining = Math.max(0, payment.due - payment.received)
  const timePct = Math.max(0, Math.min(100, (payment.deadlineSec / CASH_TIMEOUT_SEC) * 100))

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-8 sm:py-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Cash payment</h2>
        <p className="mt-1 text-sm font-medium text-black/70 sm:text-base">
          Insert bills one at a time into the bill acceptor below the screen.
        </p>

        <div className="mt-4 grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-4">
            {/* Main card — amount + bills left, live counters and timer right */}
            <KCard className="p-4 sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <h3 className="font-display text-xl font-bold sm:text-2xl">Insert cash</h3>
                <span className="inline-flex min-w-0 items-center justify-center rounded-lg border-[3px] border-black bg-white px-1 py-1 font-mono text-[10px] font-bold sm:px-3 sm:text-sm">
                  Ref {payment.reference}
                </span>
              </div>

              {collecting ? (
                <div className="mt-4 grid items-start gap-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  {/* Amount due + accepted bills */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-black/60">Amount due</p>
                    <Money value={payment.due} className="text-5xl" />

                    <p className="mt-4 text-xs font-bold uppercase tracking-wide text-black/60">Accepted bills</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {CASH_DENOMINATIONS.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center rounded-lg border-[3px] border-black bg-white px-2 py-0.5 font-display text-sm font-bold"
                        >
                          {formatPeso(d)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live counters, timer and guidance */}
                  <div className="min-w-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="kb-card-flat px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-black/60">Received so far</p>
                        <Money value={payment.received} className="text-2xl" />
                      </div>
                      <div className="kb-card-flat px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-black/60">Remaining</p>
                        <Money value={remaining} className="text-2xl" />
                      </div>
                    </div>

                    <ProgressBar
                      className="mt-3"
                      value={timePct}
                      tone={payment.deadlineSec < 30 ? 'coral' : 'lime'}
                      label="Time remaining to pay"
                    />

                    <p className="mt-2.5 font-display text-lg font-bold tabular-nums">
                      {formatCountdown(payment.deadlineSec)} to pay
                    </p>

                    <div className="mt-2 flex items-start gap-2">
                      <Info className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                      <p className="text-sm font-semibold">Please pay the exact amount.</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </KCard>

            {/* Success */}
            {payment.status === 'confirmed' ? (
              <KCard tone="lime" className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-xl font-bold">Payment received</h3>
                </div>

                <div className="mt-2">
                  <KeyVal k="Price" v={<Money value={payment.due} />} />
                  <KeyVal k="Amount received" v={<Money value={payment.received} />} />
                  <KeyVal k="Excess to return" v={<Money value={payment.excess} />} />
                </div>

                <p className="mt-2 text-sm font-semibold">
                  Excess is returned from the cash tray below the keypad.
                </p>

                <div className="mt-2 flex items-center gap-2 text-[15px] font-semibold">
                  <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
                  <span>Starting your print job…</span>
                </div>
              </KCard>
            ) : null}

            {/* Timed out */}
            {payment.status === 'expired' ? (
              <KCard tone="coral" className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Hourglass className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-xl font-bold">Payment timed out</h3>
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

            {/* Failed */}
            {payment.status === 'failed' ? (
              <KCard tone="coral" className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <TriangleAlert className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-xl font-bold">Payment failed</h3>
                </div>
                <p className="mt-2 text-[15px] font-semibold">{payment.message}</p>
                {payment.refundNote ? <p className="mt-1 text-[15px] font-bold">{payment.refundNote}</p> : null}
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

            <div className="flex min-w-0 flex-col gap-3">
              <KCard tone="cream" className="flex w-full items-center gap-3 px-4 py-3">
                <Info className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                <p className="text-sm font-semibold">
                  Overpayments are automatically returned from the cash tray below the keypad.
                </p>
              </KCard>
              {awaiting ? (
                <KButton tone="white" icon={X} full onClick={() => dispatch({ type: 'PAYMENT_CANCEL' })}>
                  Cancel payment
                </KButton>
              ) : null}
            </div>
          </div>

          <PriceSummary className="w-full" />
        </div>
      </motion.div>
    </div>
  )
}
