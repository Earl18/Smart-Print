'use client'

import { motion } from 'framer-motion'
import {
  Banknote,
  Check,
  CheckCircle2,
  Info,
  ListOrdered,
  LoaderCircle,
  Printer,
  RotateCcw,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, ProgressBar, SectionHeading, StatusPill } from '@/kiosk/components/primitives'
import { colorLabel } from '@/kiosk/lib/format'
import type { PrintStatus } from '@/kiosk/lib/types'

/* ============================================================
   PRINTING — live status timeline, page counter, fault recovery.
   The paid job is never reset from this screen: faults offer
   retry (JOB_RETRY) or staff help (JOB_SUPPORT) only.
   ============================================================ */

type StepState = 'done' | 'active' | 'pending'

const STEPS: { label: string; desc: string; icon: LucideIcon }[] = [
  { label: 'Paid', desc: 'Payment confirmed', icon: Banknote },
  { label: 'Queued', desc: 'Job sent to the printer', icon: ListOrdered },
  { label: 'Printing', desc: 'Your pages are coming out', icon: Printer },
  { label: 'Completed', desc: 'Ready to collect', icon: CheckCircle2 },
]

const AT_PRINTER: PrintStatus[] = ['printing', 'paper_jam', 'out_of_paper']
const PAST_QUEUE: PrintStatus[] = ['printing', 'paper_jam', 'out_of_paper', 'completed']

function stepState(index: number, status: PrintStatus): StepState {
  switch (index) {
    case 0:
      return 'done' // payment is always confirmed once this screen shows
    case 1:
      if (status === 'queued') return 'active'
      return PAST_QUEUE.includes(status) ? 'done' : 'pending'
    case 2:
      if (AT_PRINTER.includes(status)) return 'active'
      return status === 'completed' ? 'done' : 'pending'
    default:
      return status === 'completed' ? 'done' : 'pending'
  }
}

function statusView(status: PrintStatus): { tone: 'ok' | 'error' | 'info'; icon: LucideIcon; word: string } {
  switch (status) {
    case 'idle':
      return { tone: 'info', icon: LoaderCircle, word: 'Preparing' }
    case 'queued':
      return { tone: 'info', icon: ListOrdered, word: 'Queued' }
    case 'printing':
      return { tone: 'info', icon: Printer, word: 'Printing' }
    case 'paper_jam':
      return { tone: 'error', icon: TriangleAlert, word: 'Paper jam' }
    case 'out_of_paper':
      return { tone: 'error', icon: Printer, word: 'Out of paper' }
    case 'completed':
      return { tone: 'ok', icon: CheckCircle2, word: 'Completed' }
  }
}

export function PrintingScreen() {
  const { state, dispatch } = useKiosk()

  const { status } = state.job
  const sv = statusView(status)
  const showProgress = status === 'printing' || status === 'queued'
  const pct = (state.job.pagesDone / Math.max(1, state.job.pagesTotal)) * 100

  const faultButtons = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <KButton icon={RotateCcw} onClick={() => dispatch({ type: 'JOB_RETRY' })}>
        Retry printing
      </KButton>
      <KButton tone="white" icon={Wrench} onClick={() => dispatch({ type: 'JOB_SUPPORT' })}>
        Get help
      </KButton>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-5">
          <SectionHeading sub="You can watch the progress — your prints come out of the tray below the screen.">
            Printing your job
          </SectionHeading>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-xl border-[3px] border-black bg-white px-3 py-1.5 font-mono text-sm font-bold">
              Job {state.job.id}
            </span>
            <span className="rounded-xl border-[3px] border-black bg-white px-3 py-1.5 font-mono text-sm font-bold">
              Order {state.payment.orderRef}
            </span>
            <StatusPill tone={sv.tone} icon={sv.icon}>
              {sv.word}
            </StatusPill>
          </div>
        </div>

        {/* Status timeline — straight rows, no rotation */}
        <KCard>
          <ol className="flex flex-col">
            {STEPS.map((step, i) => {
              const st = stepState(i, status)
              const StepIcon = step.icon
              const passed = st === 'done'
              return (
                <li key={step.label} className="relative flex gap-4 pb-7 last:pb-0 sm:gap-5">
                  {i < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-12 bottom-0 left-[22px] w-[3px]',
                        passed ? 'bg-black' : 'bg-black/20',
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-black',
                      passed && 'kb-lime',
                      st === 'active' && 'bg-black text-white',
                      st === 'pending' && 'bg-white',
                    )}
                  >
                    {passed ? (
                      <Check className="size-6" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <StepIcon
                        className={cn('size-6', st === 'pending' && 'text-black/40')}
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col justify-center gap-0.5 py-1">
                    <p className={cn('font-display text-lg font-bold sm:text-xl', st === 'pending' && 'text-black/50')}>
                      {step.label}
                    </p>
                    <p className={cn('text-sm font-medium', st === 'pending' ? 'text-black/40' : 'text-black/60')}>
                      {step.desc}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </KCard>

        {/* Live page counter while queued / printing */}
        {showProgress ? (
          <KCard>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-display text-4xl font-bold tabular-nums">
                Page {state.job.pagesDone} of {state.job.pagesTotal}
              </p>
              <p className="font-display text-lg font-bold text-black/60">{Math.round(pct)}%</p>
            </div>
            <ProgressBar className="mt-4" value={pct} label="Print progress" />
            {state.job.message ? (
              <p className="mt-3 text-sm font-semibold text-black/60">{state.job.message}</p>
            ) : null}
            <p className="mt-3 text-sm font-semibold text-black/70">
              {state.prefs.copies} {state.prefs.copies === 1 ? 'copy' : 'copies'} · {state.prefs.paper} ·{' '}
              {colorLabel(state.prefs.color)}
            </p>
          </KCard>
        ) : null}

        {/* Fault states — the paid job is kept, never reset */}
        {status === 'paper_jam' ? (
          <KCard tone="coral">
            <div className="flex flex-col gap-4">
              <StatusPill tone="error" icon={TriangleAlert} className="self-start">
                Paper jam
              </StatusPill>
              <p className="text-base font-semibold sm:text-lg">
                Your job is safe — it stays paid and saved on this kiosk. Clear the jam and continue, or get help.
              </p>
              {faultButtons}
            </div>
          </KCard>
        ) : null}

        {status === 'out_of_paper' ? (
          <KCard tone="coral">
            <div className="flex flex-col gap-4">
              <StatusPill tone="error" icon={Printer} className="self-start">
                Out of paper
              </StatusPill>
              <p className="text-base font-semibold sm:text-lg">
                Our staff has been notified. Your job stays paid and saved — it resumes as soon as paper is loaded.
              </p>
              {faultButtons}
            </div>
          </KCard>
        ) : null}

        <p className="flex items-center justify-center gap-2 text-xs font-semibold text-black/60">
          <Info className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
          Leaving this screen does not cancel your job.
        </p>
      </motion.div>
    </div>
  )
}
