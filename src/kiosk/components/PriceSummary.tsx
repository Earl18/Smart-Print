'use client'

import { FileText, Image as ImageIcon, Files, FileWarning } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { colorLabel, kindLabel } from '@/kiosk/lib/format'
import { DashedDivider, KeyVal, KCard, Money } from '@/kiosk/components/primitives'
import { cn } from '@/lib/utils'
import type { DocKind } from '@/kiosk/lib/types'

function KindIconBadge({ kind }: { kind: DocKind }) {
  const cls = 'size-6'
  if (kind === 'image') return <ImageIcon className={cls} strokeWidth={2.5} aria-hidden />
  if (kind === 'unknown') return <FileWarning className={cls} strokeWidth={2.5} aria-hidden />
  return <Files className={cls} strokeWidth={2.5} aria-hidden />
}

/**
 * Price summary rail. Large screens show it beside the step;
 * small screens stack it under the step (grid handles the break).
 */
export function PriceSummary({ className, compact }: { className?: string; compact?: boolean }) {
  const { state } = useKiosk()
  const { price, doc, prefs } = state
  if (!price || !doc) return null

  if (compact) {
    return (
      <div
        className={cn(
          'kb-card kb-lime flex items-center justify-between gap-4 px-5 py-4',
          className,
        )}
        aria-label="Total due"
      >
        <span className="font-display text-lg font-bold">Total due</span>
        <Money value={price.total} className="text-3xl" />
      </div>
    )
  }

  return (
    <KCard className={className} aria-label="Price summary">
      <div className="flex items-center gap-3">
        <span className="kb-cream flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
          <KindIconBadge kind={doc.kind} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold sm:text-lg">{doc.name}</p>
          <p className="text-sm font-medium text-black/60">{kindLabel(doc.kind)}</p>
        </div>
      </div>

      <DashedDivider />

      <KeyVal k="Type" v={kindLabel(doc.kind)} />
      <KeyVal k="Pages" v={price.pages} />
      <KeyVal k="Images detected" v={doc.images} />
      <KeyVal k="Paper" v={prefs.paper} />
      <KeyVal k="Color" v={colorLabel(prefs.color)} />

      <DashedDivider />

      <KeyVal k="Price per copy" v={<Money value={price.perCopy} />} />
      <KeyVal k="Copies" v={`× ${price.copies}`} />
      <KeyVal k="Subtotal" v={<Money value={price.subtotal} />} />

      <div className="kb-lime mt-4 flex items-center justify-between gap-3 rounded-xl border-[3px] border-black px-4 py-3">
        <span className="font-display text-lg font-bold sm:text-xl">Total</span>
        <Money value={price.total} className="text-2xl sm:text-3xl" />
      </div>

      <p className="mt-3 text-xs font-semibold text-black/60">
        ₱{price.perPage} per page · {price.pages} {price.pages === 1 ? 'page' : 'pages'} per copy ·{' '}
        {price.copies} {price.copies === 1 ? 'copy' : 'copies'}
      </p>
    </KCard>
  )
}
