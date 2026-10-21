import Link from 'next/link'
import { ArrowRight, House, SearchX } from 'lucide-react'
import { KioskLogo } from '@/kiosk/components/Logo'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-kpaper px-4 py-16 text-center">
      <KioskLogo className="size-24 sm:size-28" alt="" />
      <p className="font-display text-7xl font-bold tracking-tight sm:text-8xl">
        4<span className="kb-lime inline-block -rotate-2 rounded-xl border-[3px] border-black px-2">0</span>4
      </p>
      <div>
        <h1 className="flex items-center justify-center gap-2 font-display text-2xl font-bold sm:text-3xl">
          <SearchX className="size-6" strokeWidth={2.5} aria-hidden />
          This page never printed
        </h1>
        <p className="mx-auto mt-2 max-w-md font-semibold text-black/60">
          The page you are looking for does not exist or was moved. Head back home, or go straight to the kiosk.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="kb-btn kb-btn-lime"
        >
          <House className="size-5" strokeWidth={2.5} aria-hidden />
          Back to home
        </Link>
        <Link
          href="/kiosk"
          className="kb-btn kb-btn-white"
        >
          <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />
          Open the kiosk
        </Link>
      </div>
    </div>
  )
}
