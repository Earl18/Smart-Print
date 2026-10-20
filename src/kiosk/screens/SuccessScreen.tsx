'use client'

import { motion } from 'framer-motion'
import { Check, CheckCircle2, FileCheck2, Printer, Wrench } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard } from '@/kiosk/components/primitives'

/* ============================================================
   SUCCESS — job finished. Prints are in the tray, the uploaded
   file has been wiped from the kiosk. Done exits, report opens
   the problem form without losing the completion summary.
   ============================================================ */

export function SuccessScreen() {
  const { state, dispatch } = useKiosk()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        <KCard tone="lime" className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
          <CheckCircle2 className="size-16" strokeWidth={2.5} aria-hidden />
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Print job complete!</h1>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="rounded-xl border-[3px] border-black bg-white px-3 py-1.5 font-mono text-sm font-bold">
              Ref {state.payment.orderRef}
            </span>
            <span className="rounded-xl border-[3px] border-black bg-white px-3 py-1.5 font-mono text-sm font-bold">
              Job {state.job.id}
            </span>
          </div>

          <p className="font-display text-2xl font-bold">
            {state.completedCopies} {state.completedCopies === 1 ? 'copy' : 'copies'} printed
          </p>
        </KCard>

        <KCard>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3">
              <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
                <Printer className="size-5" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-[15px] font-semibold">Collect your prints from the tray below the screen.</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
                <FileCheck2 className="size-5" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-[15px] font-semibold">Your uploaded file has been deleted from this kiosk.</span>
            </li>
          </ul>
        </KCard>

        <div className="flex flex-col gap-3 sm:flex-row">
          <KButton
            size="xl"
            tone="lime"
            icon={Check}
            className="w-full sm:flex-1"
            onClick={() => dispatch({ type: 'DONE' })}
          >
            Done
          </KButton>
          <KButton
            tone="white"
            icon={Wrench}
            className="w-full sm:flex-1"
            onClick={() => dispatch({ type: 'REPORT_OPEN' })}
          >
            Report a problem
          </KButton>
        </div>

        <p className="text-center text-sm font-medium text-black/60">
          This screen returns to the start automatically.
        </p>
      </motion.div>
    </div>
  )
}
