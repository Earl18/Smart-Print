'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Delete,
  Globe,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  XCircle,
} from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, KeyVal, StatusPill } from '@/kiosk/components/primitives'
import { kioskConfigService } from '@/kiosk/services'
import { cn } from '@/lib/utils'

/**
 * Protected maintenance access. Opens from a 3-second long-press on the
 * kiosk logo, guarded by the operator PIN. Never part of the customer flow.
 */
export function MaintenanceOverlay() {
  const { state } = useKiosk()
  const m = state.maintenance
  if (m.screen === 'closed') return null
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={m.screen === 'pin' ? 'Maintenance PIN entry' : 'Maintenance'}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {m.screen === 'pin' ? <PinEntry /> : <MaintenanceScreen />}
      </motion.div>
    </div>
  )
}

/* ============================================================
   PIN entry — 6-digit keypad, lockout after repeated failures
   ============================================================ */

function PinEntry() {
  const { state, dispatch } = useKiosk()
  const [digits, setDigits] = useState('')
  const locked = state.maintenance.lockRemain > 0
  const error = state.maintenance.error

  /* The 6th digit submits the PIN. The entry is cleared on submit so a
     repeated wrong PIN (same error text) can never wedge the keypad. */
  const push = (d: string) => {
    if (locked) return
    const next = digits + d
    if (next.length >= 6) {
      setDigits('')
      dispatch({ type: 'MAINTENANCE_SUBMIT_PIN', pin: next })
    } else {
      setDigits(next)
    }
  }

  const cfg = kioskConfigService.load()

  return (
    <KCard className="relative">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl border-[3px] border-black bg-black text-white shadow-[3px_3px_0_#000]">
          <LockKeyhole className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold">Maintenance access</h2>
          <p className="mt-1 text-[15px] font-medium text-black/70">
            {cfg
              ? `Enter the operator PIN for ${cfg.license.kioskName}`
              : 'Enter the operator PIN (default 000000)'}
          </p>
        </div>

        {/* Digit boxes */}
        <motion.div
          key={error ?? 'clean'}
          animate={error ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex gap-2"
          aria-label="PIN entry"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                'flex size-11 items-center justify-center rounded-lg border-[3px] border-black bg-white font-display text-xl font-bold sm:size-12',
                digits.length > i && 'bg-black text-white',
              )}
            >
              {digits.length > i ? '•' : ''}
            </span>
          ))}
        </motion.div>
        {locked ? (
          <StatusPill tone="info" icon={TriangleAlert}>
            Locked — try again in {state.maintenance.lockRemain}s
          </StatusPill>
        ) : error ? (
          <p className="flex items-center gap-2 font-display text-sm font-bold text-kcoral" role="alert">
            <XCircle className="size-5" strokeWidth={2.5} aria-hidden />
            {error}
          </p>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-wide text-black/40">
            {6 - digits.length} {6 - digits.length === 1 ? 'digit' : 'digits'} remaining
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="mt-5 grid grid-cols-3 gap-2.5" aria-label="PIN keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            className="kb-btn min-h-16! px-0! text-2xl!"
            disabled={locked}
            aria-label={`Digit ${d}`}
            onClick={() => push(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="kb-btn kb-btn-white min-h-16! px-0! text-lg!"
          disabled={locked || digits.length === 0}
          aria-label="Clear PIN"
          onClick={() => setDigits('')}
        >
          C
        </button>
        <button
          type="button"
          className="kb-btn min-h-16! px-0! text-2xl!"
          disabled={locked}
          aria-label="Digit 0"
          onClick={() => push('0')}
        >
          0
        </button>
        <button
          type="button"
          className="kb-btn kb-btn-white min-h-16! px-0!"
          disabled={locked || digits.length === 0}
          aria-label="Delete last digit"
          onClick={() => setDigits((s) => s.slice(0, -1))}
        >
          <Delete className="size-6" strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      <KButton tone="white" full icon={ArrowLeft} className="mt-4" onClick={() => dispatch({ type: 'MAINTENANCE_CLOSE' })}>
        Back to kiosk
      </KButton>
    </KCard>
  )
}

/* ============================================================
   Maintenance screen — kiosk info + protected reset
   ============================================================ */

function MaintenanceScreen() {
  const { state, dispatch } = useKiosk()
  const [confirmText, setConfirmText] = useState('')
  const cfg = kioskConfigService.load()
  const canReset = confirmText === 'RESET'

  return (
    <div className="flex flex-col gap-4">
      <KCard>
        <div className="flex items-center gap-4">
          <span className="kb-cream flex size-14 shrink-0 rotate-[-2deg] items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
            <Wrench className="size-7" strokeWidth={2.5} aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">Maintenance</h2>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-black/60">
              <ShieldCheck className="size-4" strokeWidth={2.5} aria-hidden /> Operator access confirmed
            </p>
          </div>
        </div>

        {cfg ? (
          <div className="mt-4">
            <KeyVal k="Operator" v={cfg.license.operatorName} />
            <KeyVal k="Kiosk name" v={cfg.license.kioskName} />
            <KeyVal k="Mode" v={cfg.mode === 'offline' ? 'Offline' : cfg.wifiSsid ? `Online · ${cfg.wifiSsid}` : 'Online'} />
            <KeyVal k="Settings version" v={`v${cfg.settingsVersion}`} />
            <KeyVal k="Website" v={<span className="inline-flex items-center gap-1.5"><Globe className="size-4" aria-hidden />{cfg.websiteUrl}</span>} />
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-black/60">No kiosk configuration is stored.</p>
        )}
      </KCard>

      {/* Reset */}
      <KCard>
        <div className="flex items-center gap-3">
          <span className="kb-coral flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
            <RotateCcw className="size-6" strokeWidth={2.5} aria-hidden />
          </span>
          <h3 className="font-display text-lg font-bold">Reset kiosk</h3>
        </div>

        <div className="kb-card-flat kb-coral mt-4 flex items-start gap-3 p-4" role="alert">
          <TriangleAlert className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
          <p className="text-sm font-bold">
            This clears the kiosk&apos;s license and configuration. Customer jobs in progress will be kept as
            held transactions.
          </p>
        </div>

        <label htmlFor="reset-confirm" className="mt-4 block text-[15px] font-semibold">
          Type <span className="font-display font-bold underline decoration-[3px] underline-offset-4">RESET</span> to confirm
        </label>
        <input
          id="reset-confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          placeholder="RESET"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="reset-hint"
          className="kb-input mt-2 font-display text-xl font-bold tracking-widest"
        />
        <p id="reset-hint" className="mt-2 text-sm font-medium text-black/60">
          After the reset the kiosk restarts into first-time setup.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <KButton tone="coral" icon={RotateCcw} disabled={!canReset} onClick={() => dispatch({ type: 'MAINTENANCE_CONFIRM_RESET' })}>
            Reset kiosk
          </KButton>
          <KButton tone="white" icon={ArrowLeft} onClick={() => dispatch({ type: 'MAINTENANCE_CLOSE' })}>
            Back to kiosk
          </KButton>
        </div>
      </KCard>
    </div>
  )
}
