'use client'

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPeso } from '@/kiosk/lib/format'

/* ============================================================
   Smart Print Neo-Brutalist primitives.
   Rules baked in here:
   - 3px black borders, hard offset shadows, flat colors
   - buttons press down on tap (translate 3px, shadow shrinks)
   - touch targets >= 64px
   - status always = icon + words
   ============================================================ */

export type KButtonTone = 'lime' | 'coral' | 'blue' | 'white' | 'dark'
export type KButtonSize = 'md' | 'lg' | 'xl'

export interface KButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: KButtonTone
  size?: KButtonSize
  icon?: LucideIcon
  full?: boolean
}

export function KButton({ tone = 'lime', size = 'lg', icon: Icon, full, className, children, ...rest }: KButtonProps) {
  return (
    <button
      className={cn(
        'kb-btn',
        `kb-btn-${tone}`,
        size === 'xl' && 'min-h-[76px] px-10 text-2xl sm:min-h-[84px] sm:text-3xl',
        size === 'lg' && 'text-lg sm:text-xl',
        size === 'md' && 'px-6 text-base',
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {Icon ? <Icon className="size-6 shrink-0 sm:size-7" strokeWidth={2.5} aria-hidden /> : null}
      {children}
    </button>
  )
}

export type KCardTone = 'white' | 'lime' | 'coral' | 'blue' | 'cream'

export function KCard({
  tone = 'white',
  flat,
  className,
  children,
  ...rest
}: { tone?: KCardTone; flat?: boolean; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        flat ? 'kb-card-flat' : 'kb-card',
        'p-5 sm:p-6',
        tone === 'lime' && 'kb-lime',
        tone === 'coral' && 'kb-coral',
        tone === 'blue' && 'kb-blue',
        tone === 'cream' && 'kb-cream',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon
  active?: boolean
  disabledReason?: string
  children: ReactNode
}

/** Selectable chip / card. Renders as a plain div when no onClick is given. */
export function Chip({ icon: Icon, active, children, className, onClick, disabled, disabledReason, ...rest }: ChipProps) {
  const content = (
    <>
      {Icon ? <Icon className="size-6 shrink-0 sm:size-7" strokeWidth={2.5} aria-hidden /> : null}
      {children}
    </>
  )
  if (!onClick) {
    return <div className={cn('kb-chip', className)}>{content}</div>
  }
  return (
    <button
      type="button"
      className={cn('kb-chip', active && 'kb-chip-active', className)}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={disabled ? disabledReason : undefined}
      {...rest}
    >
      {content}
    </button>
  )
}

export type StatusTone = 'ok' | 'error' | 'info' | 'warn'

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  ok: 'kb-lime',
  error: 'kb-coral',
  info: 'kb-blue',
  warn: 'bg-white',
}

/** Status is always icon + words. */
export function StatusPill({
  tone,
  icon: Icon,
  children,
  className,
}: {
  tone: StatusTone
  icon: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border-[3px] border-black px-3 py-1.5 text-sm font-bold',
        STATUS_TONE_CLASS[tone],
        className,
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
      <span>{children}</span>
    </span>
  )
}

/** Prices and numbers — always Space Grotesk bold. */
export function Money({ value, className }: { value: number; className?: string }) {
  return <span className={cn('font-display font-bold tabular-nums', className)}>{formatPeso(value)}</span>
}

export function ProgressBar({
  value,
  tone = 'lime',
  className,
  label,
}: {
  value: number
  tone?: 'lime' | 'coral' | 'blue'
  className?: string
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('kb-progress-track', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn('kb-progress-fill', tone === 'coral' && 'kb-progress-fill-coral', tone === 'blue' && 'kb-progress-fill-blue')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

/** Decorative sticker badge — the only element allowed a slight rotation. */
export function IconBadge({
  icon: Icon,
  tone = 'lime',
  size = 'md',
  rotate = -2,
  className,
}: {
  icon: LucideIcon
  tone?: KCardTone | 'dark'
  size?: 'sm' | 'md' | 'lg'
  rotate?: number
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl border-[3px] border-black shadow-[3px_3px_0_#000]',
        tone === 'lime' && 'kb-lime',
        tone === 'coral' && 'kb-coral',
        tone === 'blue' && 'kb-blue',
        tone === 'cream' && 'kb-cream',
        tone === 'dark' && 'bg-black text-white',
        tone === 'white' && 'bg-white',
        size === 'sm' && 'size-10',
        size === 'md' && 'size-14',
        size === 'lg' && 'size-20',
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <Icon className={size === 'sm' ? 'size-5' : size === 'md' ? 'size-7' : 'size-10'} strokeWidth={2.5} />
    </span>
  )
}

export function KeyVal({
  k,
  v,
  className,
  vClassName,
}: {
  k: ReactNode
  v: ReactNode
  className?: string
  vClassName?: string
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-1.5', className)}>
      <span className="text-[15px] font-medium text-black/70">{k}</span>
      <span className={cn('text-right font-display text-[15px] font-bold', vClassName)}>{v}</span>
    </div>
  )
}

export function DashedDivider({ className }: { className?: string }) {
  return <div aria-hidden className={cn('my-4 border-t-[3px] border-dashed border-black', className)} />
}

export function SectionHeading({
  children,
  sub,
  className,
}: {
  children: ReactNode
  sub?: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">{children}</h2>
      {sub ? <p className="mt-2 max-w-2xl text-base font-medium text-black/70 sm:text-lg">{sub}</p> : null}
    </div>
  )
}

export function Notice({ children, icon: Icon }: { children: ReactNode; icon: LucideIcon }) {
  return (
    <div className="kb-card-flat kb-cream flex items-center gap-3 px-4 py-3 text-sm font-semibold" role="status">
      <Icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
      <span>{children}</span>
    </div>
  )
}
