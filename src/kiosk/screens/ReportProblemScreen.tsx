'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Contrast,
  FileWarning,
  FileX2,
  Rows3,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { Chip, KButton, KCard, SectionHeading } from '@/kiosk/components/primitives'
import type { ReportCode } from '@/kiosk/lib/types'

/* ============================================================
   REPORT PROBLEM — one-tap issue picker plus optional details.
   Straight form layout, single-select chips, submit gated on a
   chosen issue code. Reaches here from SUCCESS or PRINTING;
   REPORT_BACK returns to the right one.
   ============================================================ */

const ISSUES: { code: ReportCode; label: string; icon: LucideIcon }[] = [
  { code: 'lines', label: 'Lines on print', icon: Rows3 },
  { code: 'faded', label: 'Faded print', icon: Contrast },
  { code: 'wrong_missing', label: 'Wrong or missing pages', icon: FileWarning },
  { code: 'damaged', label: 'Damaged print', icon: FileX2 },
  { code: 'other', label: 'Something else', icon: CircleHelp },
]

export function ReportProblemScreen() {
  const { state, dispatch } = useKiosk()

  if (state.report.submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center py-6 sm:py-10"
        >
          <KCard className="flex w-full max-w-lg flex-col items-center gap-5 p-8 text-center sm:p-10">
            <span className="kb-lime flex size-16 items-center justify-center rounded-full border-[3px] border-black shadow-[3px_3px_0_#000]">
              <CheckCircle2 className="size-8" strokeWidth={2.5} aria-hidden />
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Report received</h2>
            <p className="text-base font-medium text-black/70 sm:text-lg">
              Our technicians have been notified about job {state.job.id}. Thanks for helping us keep this kiosk in
              top shape.
            </p>
            <KButton icon={ArrowLeft} onClick={() => dispatch({ type: 'REPORT_BACK' })}>
              Back
            </KButton>
          </KCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        <SectionHeading sub="Tell us what went wrong — our technicians check every report.">
          Report a problem
        </SectionHeading>

        <KCard className="flex flex-col gap-4">
          <h3 className="font-display text-xl font-bold sm:text-2xl">What went wrong?</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {ISSUES.map((issue) => (
              <Chip
                key={issue.code}
                icon={issue.icon}
                active={state.report.code === issue.code}
                className="w-full justify-start"
                onClick={() => dispatch({ type: 'REPORT_SET', code: issue.code })}
              >
                {issue.label}
              </Chip>
            ))}
          </div>
        </KCard>

        <KCard className="flex flex-col gap-3">
          <h3 className="font-display text-xl font-bold sm:text-2xl">Details (optional)</h3>
          <textarea
            className="kb-input min-h-28 resize-none"
            placeholder="Anything else our technicians should know?"
            value={state.report.note}
            onChange={(e) => dispatch({ type: 'REPORT_SET', note: e.target.value })}
            aria-label="Problem details"
          />
        </KCard>

        <div className="grid grid-cols-2 gap-2.5">
          <span className="flex min-w-0 items-center justify-center break-all rounded-xl border-[3px] border-black bg-white px-2 py-1.5 text-center font-mono text-xs font-bold sm:text-sm">
            Job {state.job.id}
          </span>
          <span className="flex min-w-0 items-center justify-center break-all rounded-xl border-[3px] border-black bg-white px-2 py-1.5 text-center font-mono text-xs font-bold sm:text-sm">
            Order {state.payment.orderRef}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <KButton
            icon={Send}
            disabled={!state.report.code}
            className="w-full sm:flex-1"
            onClick={() => dispatch({ type: 'REPORT_SUBMIT' })}
          >
            Submit report
          </KButton>
          <KButton
            tone="white"
            icon={ArrowLeft}
            className="w-full sm:flex-1"
            onClick={() => dispatch({ type: 'REPORT_BACK' })}
          >
            Back
          </KButton>
        </div>
      </motion.div>
    </div>
  )
}
