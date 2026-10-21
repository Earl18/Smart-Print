'use client'

import { cn } from '@/lib/utils'

/**
 * The official Smart Print logo — the round printer sticker.
 * Rendered as-is (the artwork carries its own outline and drop shadow)
 * so the mark looks identical everywhere: top bar, welcome hero, boot
 * screen, setup wizard, in-kiosk website and the bundled website.
 */
export function KioskLogo({
  className,
  alt = 'Smart Print logo',
}: {
  className?: string
  alt?: string
}) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={223}
      height={223}
      draggable={false}
      className={cn('select-none rounded-full object-cover', className)}
    />
  )
}
