'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Banknote, Info, Smartphone, WifiOff } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, Notice, SectionHeading, StatusPill } from '@/kiosk/components/primitives'
import { PriceSummary } from '@/kiosk/components/PriceSummary'

export function PaymentMethodScreen() {
  const { state, dispatch } = useKiosk()
  const ewalletOffline = !state.online

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SectionHeading sub="Pick how you want to pay. The exact amount is shown on the next step.">
          How would you like to pay?
        </SectionHeading>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-6">
            {state.notice ? <Notice icon={Info}>{state.notice}</Notice> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Cash — ! modifiers so utilities win over the unlayered .kb-chip base styles */}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SELECT_METHOD', method: 'cash' })}
                className="kb-chip min-h-[220px]! flex-col items-start! justify-start! gap-2 rounded-2xl! bg-klime! p-6! text-left"
              >
                <Banknote className="size-10 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="font-display text-2xl font-bold">Cash</span>
                <span className="text-base font-semibold">Insert bills — exact amount appreciated.</span>
                <span className="text-xs font-medium text-black/70">
                  Overpayments are returned. Cancelling returns the money you inserted.
                </span>
              </button>

              {/* E-wallet */}
              <button
                type="button"
                disabled={ewalletOffline}
                onClick={() => dispatch({ type: 'SELECT_METHOD', method: 'ewallet' })}
                className="kb-chip min-h-[220px]! flex-col items-start! justify-start! gap-2 rounded-2xl! bg-kblue! p-6! text-left"
              >
                <Smartphone className="size-10 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="font-display text-2xl font-bold">E-wallet</span>
                <span className="text-base font-semibold">GCash, Maya and other e-wallet apps.</span>
                {ewalletOffline ? (
                  <>
                    <StatusPill tone="error" icon={WifiOff}>
                      Needs internet
                    </StatusPill>
                    <span className="text-xs font-semibold">E-wallet payments require a connection.</span>
                  </>
                ) : null}
                <span className="text-xs font-medium text-black/70">
                  Your e-wallet is charged only after confirmation. Failed or expired payments are never charged.
                </span>
              </button>
            </div>

            <div>
              <KButton tone="white" icon={ArrowLeft} full onClick={() => dispatch({ type: 'PAYMENT_BACK' })}>
                Back to review
              </KButton>
            </div>
          </div>

          <PriceSummary className="w-full" />
        </div>
      </motion.div>
    </div>
  )
}
