'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Dialog in the shared Neo-Brutalist system: black border, hard shadow,
    Escape to close, click-outside to close. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'kb-scroll max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-2xl border-[3px] border-black bg-white shadow-[8px_8px_0_#000]',
          className,
        )}
      >
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b-[3px] border-black bg-klime px-4 py-3">
          <h2 className="font-display text-lg font-bold sm:text-xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-white active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="size-5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
        {footer ? <div className="border-t-[3px] border-black bg-kpaper p-4">{footer}</div> : null}
      </div>
    </div>
  )
}
