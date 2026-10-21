import type { Metadata } from 'next'
import Link from 'next/link'
import { KioskLogo } from '@/kiosk/components/Logo'

export const metadata: Metadata = {
  title: 'Send your file',
}

/* Deliberately bare phone-first shell: no public header/footer, no fonts,
   no scripts — just the brand mark, a centered column and the upload flow. */
export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-kpaper">
      <header className="border-b-[3px] border-black">
        <div className="mx-auto flex h-14 w-full max-w-md items-center px-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Smart Print home">
            <KioskLogo className="size-9" alt="" />
            <span className="font-display text-base font-bold leading-none tracking-tight sm:text-lg">
              SMART
              <span className="kb-lime ml-1 inline-block rotate-1 rounded-md border-2 border-black px-1.5 py-0.5">
                PRINT
              </span>
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 sm:py-8">{children}</main>
    </div>
  )
}
