import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { KioskLogo } from '@/kiosk/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-kpaper">
      <header className="border-b-[3px] border-black">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:h-[72px] sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Smart Print home">
            <KioskLogo className="size-10 sm:size-11" alt="" />
            <span className="hidden font-display text-lg font-bold leading-none tracking-tight min-[420px]:inline sm:text-xl">
              SMART
              <span className="kb-lime ml-1 inline-block rotate-1 rounded-md border-2 border-black px-1.5 py-0.5">
                PRINT
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="ml-auto flex min-h-11 items-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
            Back to website
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">{children}</main>
    </div>
  )
}
