'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Clock, LogOut } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KButton, KCard, ProgressBar } from '@/kiosk/components/primitives'

export function InactivityOverlay() {
  const { state, dispatch } = useKiosk()
  const { warning, remainSec } = state.idle

  return (
    <AnimatePresence>
      {warning ? (
        <motion.div
          key="inactivity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
          role="alertdialog"
          aria-label="Inactivity warning"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
          >
            <KCard className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="kb-blue flex size-16 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]">
                <Clock className="size-8" strokeWidth={2.5} aria-hidden />
              </span>
              <h2 className="font-display text-3xl font-bold">Are you still there?</h2>
              <p className="text-[15px] font-medium text-black/70">
                Your session ends in {remainSec} {remainSec === 1 ? 'second' : 'seconds'}. Nothing was charged.
              </p>
              <ProgressBar value={(remainSec / 30) * 100} tone="coral" className="w-full" label="Seconds remaining" />
              <div className="mt-1 flex w-full flex-col gap-3 sm:flex-row">
                <KButton className="flex-1" onClick={() => dispatch({ type: 'IDLE_DISMISS' })}>
                  Yes — keep my session
                </KButton>
                <KButton tone="white" icon={LogOut} className="flex-1" onClick={() => dispatch({ type: 'IDLE_EXPIRE' })}>
                  No — start over
                </KButton>
              </div>
            </KCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
