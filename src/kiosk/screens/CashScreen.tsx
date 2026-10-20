'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Hourglass, Info, Loader2, TriangleAlert, X } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { Chip, KButton, KCard, KeyVal, Money, ProgressBar, SectionHeading } from '@/kiosk/components/primitives'
import { PriceSummary } from '@/kiosk/components/PriceSummary'
import { formatCountdown, formatPeso } from '@/kiosk/lib/format'
import { CASH_TIMEOUT_SEC } from '@/kiosk/lib/machine'

/** Bill denominations accepted by the kiosk's cash acceptor. */
const CASH_DENOMINATIONS = [20, 50, 100, 200, 500, 1000]

export function CashScreen() {
  const { state, dispatch } = useKiosk()
  const { payment } = state

  const awaiting = payment.status === 'awaiting'
  const collecting = awaiting && payment.received < payment.due
  const remaining = Math.max(0, payment.due - payment.received)
  const timePct = Math.max(0, Math.min(100, (payment.deadlineSec / CASH_TIMEOUT_SEC) * 100))

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SectionHeading sub="Insert bills one at a time into the bill acceptor below the screen.">
          Cash payment
        </SectionHeading>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-6">
            {/* Main card */}
            <KCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Insert cash</h3>
                <Chip className="font-mono text-sm sm:text-base">Ref {payment.reference}</Chip>
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-wide text-black/60">Amount due</p>
              <Money value={payment.due} className="text-5xl sm:text-6xl" />

              {collecting ? (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="kb-card-flat px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-black/60">Received so far</p>
                      <Money value={payment.received} className="mt-1 text-3xl" />
                    </div>
                    <div className="kb-card-flat px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-black/60">Remaining</p>
                      <Money value={remaining} className="mt-1 text-3xl" />
                    </div>
                  </div>

                  <ProgressBar
                    className="mt-6"
                    value={timePct}
                    tone={payment.deadlineSec < 30 ? 'coral' : 'lime'}
                    label="Time remaining to pay"
                  />
                  <p className="mt-3 font-display text-xl font-bold">
                    Insert money before timer ends — {formatCountdown(payment.deadlineSec)}
                  </p>

                  <div className="mt-5 flex items-start gap-2">
                    <Info className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                    <p className="text-sm font-semibold sm:text-base">Please pay the exact amount.</p>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-black/60">Accepted bills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CASH_DENOMINATIONS.map((d) => (
                        <Chip key={d} className="font-display text-base">
                          {formatPeso(d)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </KCard>

            {/* Success */}
            {payment.status === 'confirmed' ? (
              <KCard tone="lime">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-8 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-2xl font-bold">Payment received</h3>
                </div>

                <div className="mt-4">
                  <KeyVal k="Price" v={<Money value={payment.due} />} />
                  <KeyVal k="Amount received" v={<Money value={payment.received} />} />
                  <KeyVal k="Excess to return" v={<Money value={payment.excess} />} />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  Excess is returned from the cash tray below the keypad.
                </p>

                <div className="mt-4 flex items-center gap-2 font-semibold">
                  <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
                  <span>Starting your print job…</span>
                </div>
              </KCard>
            ) : null}

            {/* Timed out */}
            {payment.status === 'expired' ? (
              <KCard tone="coral">
                <div className="flex items-center gap-3">
                  <Hourglass className="size-8 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-2xl font-bold">Payment timed out</h3>
                </div>
                <p className="mt-3 text-base font-semibold">{payment.message}</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
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
              <KCard tone="coral">
                <div className="flex items-center gap-3">
                  <TriangleAlert className="size-8 shrink-0" strokeWidth={2.5} aria-hidden />
                  <h3 className="font-display text-2xl font-bold">Payment failed</h3>
                </div>
                <p className="mt-3 text-base font-semibold">{payment.message}</p>
                {payment.refundNote ? <p className="mt-2 text-base font-bold">{payment.refundNote}</p> : null}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <KButton tone="lime" onClick={() => dispatch({ type: 'PAYMENT_RETRY' })}>
                    Try again
                  </KButton>
                  <KButton tone="white" onClick={() => dispatch({ type: 'PAYMENT_CANCEL' })}>
                    Choose another method
                  </KButton>
                </div>
              </KCard>
            ) : null}

            {/* Footer */}
            {awaiting ? (
              <div>
                <KButton tone="white" icon={X} onClick={() => dispatch({ type: 'PAYMENT_CANCEL' })}>
                  Cancel payment
                </KButton>
              </div>
            ) : null}
          </div>

          <PriceSummary compact className="w-full" />
        </div>
      </motion.div>
    </div>
  )
}
