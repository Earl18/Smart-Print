'use client'

import { motion } from 'framer-motion'
import { CreditCard, Info, Pencil, X } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { Chip, KButton, KCard, Money, SectionHeading } from '@/kiosk/components/primitives'
import { PriceSummary } from '@/kiosk/components/PriceSummary'
import { colorLabel, formatPeso, kindLabel } from '@/kiosk/lib/format'

export function ReviewScreen() {
  const { state, dispatch } = useKiosk()
  const { price, doc, prefs } = state

  if (!price || !doc) return null

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SectionHeading sub="Check everything below — the price is final once payment starts.">
          Review your order
        </SectionHeading>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-6">
            {/* Card 1 — the order */}
            <KCard>
              <h3 className="font-display text-2xl font-bold">Your order</h3>

              <p className="mt-3 break-words font-display text-xl font-bold">{doc.name}</p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <Chip>{kindLabel(doc.kind)}</Chip>
                <Chip>{prefs.paper}</Chip>
                <Chip>{colorLabel(prefs.color)}</Chip>
                <Chip>
                  × {prefs.copies} {prefs.copies === 1 ? 'copy' : 'copies'}
                </Chip>
              </div>

              {/* The big price equation — always perfectly straight */}
              <div className="kb-lime mt-6 rounded-xl border-[3px] border-black p-5 text-center">
                <p className="font-display text-xl font-bold sm:text-2xl">
                  {formatPeso(price.perCopy)} per copy × {price.copies}{' '}
                  {price.copies === 1 ? 'copy' : 'copies'} =
                </p>
                <Money value={price.total} className="mt-2 inline-block text-4xl sm:text-5xl" />
              </div>
            </KCard>

            {/* Card 2 — policy note */}
            <KCard tone="cream">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                <p className="text-sm font-semibold">
                  If printing fails after payment, your job stays saved at this kiosk — you can retry it free of
                  charge or ask our staff for a refund.
                </p>
              </div>
            </KCard>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-[1.5fr_1.3fr_0.8fr] sm:gap-3">
              <KButton tone="lime" className="min-w-0 gap-1! px-1! text-xs! sm:gap-2! sm:px-2! sm:text-sm!" onClick={() => dispatch({ type: 'REVIEW_NEXT' })}>
                <CreditCard className="hidden size-5 shrink-0 sm:block" strokeWidth={2.5} aria-hidden />
                <span className="sm:hidden">Continue</span><span className="hidden sm:inline">Continue to payment</span>
              </KButton>
              <KButton tone="white" className="min-w-0 gap-1! px-1! text-xs! sm:gap-2! sm:px-2! sm:text-sm!" onClick={() => dispatch({ type: 'EDIT_PREFS' })}>
                <Pencil className="hidden size-5 shrink-0 sm:block" strokeWidth={2.5} aria-hidden />
                <span className="sm:hidden">Edit</span><span className="hidden sm:inline">Edit preferences</span>
              </KButton>
              <KButton tone="coral" className="min-w-0 gap-1! px-1! text-xs! sm:gap-2! sm:px-2! sm:text-sm!" title="Discards the order" onClick={() => dispatch({ type: 'REVIEW_CANCEL' })}>
                <X className="hidden size-5 shrink-0 sm:block" strokeWidth={2.5} aria-hidden />
                Cancel
              </KButton>
            </div>
          </div>

          <PriceSummary className="w-full" />
        </div>
      </motion.div>
    </div>
  )
}
