'use client'

import { BatteryCharging, CheckCircle2, FileText, Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { colorLabel, formatPeso, formatTimeOfDay, phaseLabel } from '@/kiosk/lib/format'
import { KButton, KCard, KeyVal, DashedDivider } from '@/kiosk/components/primitives'

export function RecoveryScreen() {
  const { state, dispatch } = useKiosk()
  const saved = state.recovery.saved

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <KCard className="w-full max-w-lg p-8">
        <div className="flex items-center gap-4">
          <span className="kb-blue flex size-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
            <BatteryCharging className="size-8" strokeWidth={2.5} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Power was interrupted</h1>
            <p className="mt-1 text-[15px] font-medium text-black/70">
              {saved
                ? `We found your transaction from ${formatTimeOfDay(state.recovery.powerLostAt ?? saved.savedAt)} — nothing was lost.`
                : 'Your transaction can be recovered.'}
            </p>
          </div>
        </div>

        {saved ? (
          <div className="mt-6">
            <DashedDivider className="my-4" />
            <KeyVal k="Transaction" v={saved.payment.orderRef || '—'} />
            <KeyVal k="Where you left off" v={phaseLabel(saved.phase)} />
            <KeyVal k="Paper · Color · Copies" v={`${saved.prefs.paper} · ${colorLabel(saved.prefs.color)} · ×${saved.prefs.copies}`} />
            {saved.doc ? (
              <KeyVal k="File" v={saved.doc.name} />
            ) : (
              <KeyVal k="File" v="Not received yet" />
            )}
            {saved.payment.received > 0 ? (
              <KeyVal k="Cash received" v={formatPeso(saved.payment.received)} />
            ) : null}
            {saved.job.id ? <KeyVal k="Print job" v={saved.job.id} /> : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <KButton icon={Play} className="flex-1" onClick={() => dispatch({ type: 'RESUME_RECOVERED' })}>
            Resume transaction
          </KButton>
          <KButton tone="white" icon={RotateCcw} className="flex-1" onClick={() => dispatch({ type: 'DISCARD_RECOVERY' })}>
            Start over
          </KButton>
        </div>

        <div className="mt-5 flex items-start gap-2 text-xs font-semibold text-black/50">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="flex items-start gap-1.5">
            <FileText className="mt-0.5 size-4 shrink-0" aria-hidden />
            Your file and payment details are kept only on this kiosk.
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-black/50">
          <CheckCircle2 className="size-4" aria-hidden /> Nothing was charged while the kiosk was off.
        </p>
      </KCard>
    </div>
  )
}
