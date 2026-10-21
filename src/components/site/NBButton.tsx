'use client'

import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'lime' | 'coral' | 'blue' | 'white' | 'dark'
type Size = 'md' | 'lg'

const toneClass: Record<Tone, string> = {
  lime: 'kb-btn-lime',
  coral: 'kb-btn-coral',
  blue: 'kb-btn-blue',
  white: 'kb-btn-white',
  dark: 'kb-btn-dark',
}

const sizeClass: Record<Size, string> = {
  md: 'min-h-14 px-5 text-base',
  lg: 'min-h-16 px-7 text-lg',
}

interface NBButtonProps {
  tone?: Tone
  size?: Size
  href?: string
  external?: boolean
  download?: boolean
  icon?: ReactNode
  className?: string
  children: ReactNode
  onClick?: ComponentProps<'button'>['onClick']
  type?: ComponentProps<'button'>['type']
  disabled?: boolean
  'aria-label'?: string
}

/** The one button used across the website and dashboards — presses down
    on tap exactly like the kiosk buttons (kb-btn in kiosk.css). */
export function NBButton({
  tone = 'lime',
  size = 'md',
  href,
  external,
  download,
  icon,
  className,
  children,
  onClick,
  type = 'button',
  disabled,
  ...aria
}: NBButtonProps) {
  const classes = cn('kb-btn', toneClass[tone], sizeClass[size], disabled && 'opacity-40', className)
  const inner = (
    <>
      {icon}
      {children}
    </>
  )

  if (href !== undefined && !disabled) {
    if (external) {
      return (
        <a href={href} download={download} className={classes} {...aria}>
          {inner}
        </a>
      )
    }
    return (
      <Link href={href} className={classes} {...aria}>
        {inner}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...aria}>
      {inner}
    </button>
  )
}
