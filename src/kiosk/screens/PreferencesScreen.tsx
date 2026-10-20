'use client'

import { motion } from 'framer-motion'
import { ArrowRight, FileText, Minus, Palette, Plus, Printer } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { Chip, IconBadge, KButton, KCard, SectionHeading } from '@/kiosk/components/primitives'
import { formatPeso } from '@/kiosk/lib/format'
import { COPIES_MAX, COPIES_MIN, PAPER_SIZES, perPageRate } from '@/kiosk/lib/pricing'

/* kb-* classes in kiosk.css are unlayered CSS, so Tailwind utilities that must
   override them (min-height, padding, gap, …) carry the `!` important modifier. */

export function PreferencesScreen() {
  const { state, dispatch } = useKiosk()
  const { paper, color, copies } = state.prefs

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-5 sm:gap-6"
      >
        <div className="flex items-start justify-between gap-4">
          <SectionHeading sub="Choose your paper, ink and copies before sending your file.">
            How do you want it printed?
          </SectionHeading>
          <IconBadge icon={Printer} tone="lime" className="mt-1 hidden sm:inline-flex" />
        </div>

        {/* Paper size */}
        <KCard>
          <p className="text-sm font-bold uppercase tracking-wide text-black/60">Paper size</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {PAPER_SIZES.map((size) => (
              <Chip
                key={size.id}
                active={paper === size.id}
                onClick={() => dispatch({ type: 'SET_PAPER', paper: size.id })}
                className="flex-col"
              >
                <span className="font-display text-lg font-bold sm:text-xl">{size.label}</span>
                <span className="text-xs font-semibold opacity-70">{size.dims}</span>
              </Chip>
            ))}
          </div>
        </KCard>

        {/* Ink */}
        <KCard>
          <p className="text-sm font-bold uppercase tracking-wide text-black/60">Ink</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Chip
              icon={FileText}
              active={color === 'bw'}
              onClick={() => dispatch({ type: 'SET_COLOR', color: 'bw' })}
              className="flex-col min-h-[120px]! gap-1! p-5!"
            >
              <span className="font-display text-lg font-bold sm:text-xl">Black & White</span>
              <span className="text-sm font-semibold opacity-70">{formatPeso(perPageRate(paper, 'bw'))} / page</span>
            </Chip>
            <Chip
              icon={Palette}
              active={color === 'color'}
              onClick={() => dispatch({ type: 'SET_COLOR', color: 'color' })}
              className="flex-col min-h-[120px]! gap-1! p-5!"
            >
              <span className="font-display text-lg font-bold sm:text-xl">Colored</span>
              <span className="text-sm font-semibold opacity-70">{formatPeso(perPageRate(paper, 'color'))} / page</span>
            </Chip>
          </div>
        </KCard>

        {/* Copies */}
        <KCard>
          <p className="text-sm font-bold uppercase tracking-wide text-black/60">Copies</p>
          <div className="mt-4 flex items-center justify-center gap-6 sm:gap-10">
            <button
              type="button"
              className="kb-btn kb-btn-white size-16 p-0!"
              disabled={copies <= COPIES_MIN}
              onClick={() => dispatch({ type: 'SET_COPIES', copies: copies - 1 })}
              aria-label="Fewer copies"
            >
              <Minus className="size-7" strokeWidth={2.5} aria-hidden />
            </button>
            <span
              className="min-w-[6rem] text-center font-display text-6xl font-bold tabular-nums"
              aria-live="polite"
            >
              {copies}
            </span>
            <button
              type="button"
              className="kb-btn kb-btn-white size-16 p-0!"
              disabled={copies >= COPIES_MAX}
              onClick={() => dispatch({ type: 'SET_COPIES', copies: copies + 1 })}
              aria-label="More copies"
            >
              <Plus className="size-7" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-black/60">
            {COPIES_MIN} to {COPIES_MAX} copies
          </p>
        </KCard>

        {/* Footer */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <KButton tone="white" className="w-full sm:w-auto" onClick={() => dispatch({ type: 'PREFS_BACK' })}>
            Back
          </KButton>
          <KButton
            tone="lime"
            icon={ArrowRight}
            className="w-full flex-1 sm:w-auto"
            onClick={() => dispatch({ type: 'PREFS_NEXT' })}
          >
            Continue
          </KButton>
        </div>
      </motion.div>
    </div>
  )
}
