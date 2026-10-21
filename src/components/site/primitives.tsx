import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Card in the shared Neo-Brutalist system. `rotate` gives decorative
    sticker lean (1–2°); never use it for forms or prices. */
export function StickerCard({
  children,
  className,
  rotate = 0,
  tone = 'white',
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  rotate?: number
  tone?: 'white' | 'cream' | 'lime' | 'coral' | 'blue' | 'black'
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  const toneClass = {
    white: 'bg-white',
    cream: 'bg-kpaper',
    lime: 'bg-klime',
    coral: 'bg-kcoral',
    blue: 'bg-kblue',
    black: 'bg-black text-white',
  }[tone]
  return (
    <Tag
      className={cn(
        'rounded-2xl border-[3px] border-black shadow-[5px_5px_0_#000]',
        toneClass,
        className,
      )}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {children}
    </Tag>
  )
}

/** Status that is always icon + words, same contract as the kiosk. */
export function StatusPill({
  tone = 'info',
  icon: Icon,
  children,
  className,
}: {
  tone?: 'ok' | 'error' | 'info' | 'warn' | 'neutral'
  icon: LucideIcon
  children: ReactNode
  className?: string
}) {
  const toneClass = {
    ok: 'bg-klime',
    error: 'bg-kcoral',
    info: 'bg-kblue',
    warn: 'bg-kcoral',
    neutral: 'bg-white',
  }[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border-[3px] border-black px-2.5 py-1 text-xs font-bold sm:text-sm',
        toneClass,
        className,
      )}
    >
      <Icon className="size-4 sm:size-5" strokeWidth={2.5} aria-hidden />
      {children}
    </span>
  )
}

/** Small badge for counts, roles and versions. */
export function Badge({
  children,
  tone = 'white',
  className,
}: {
  children: ReactNode
  tone?: 'white' | 'lime' | 'coral' | 'blue' | 'black'
  className?: string
}) {
  const toneClass = {
    white: 'bg-white',
    lime: 'bg-klime',
    coral: 'bg-kcoral',
    blue: 'bg-kblue',
    black: 'bg-black text-white',
  }[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border-2 border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  )
}
