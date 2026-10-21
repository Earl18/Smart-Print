import Link from 'next/link'
import { KioskLogo } from '@/kiosk/components/Logo'

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t-[3px] border-black bg-kpaper">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <KioskLogo className="size-12" alt="" />
            <span className="font-display text-lg font-bold leading-none tracking-tight">
              SMART
              <span className="kb-lime ml-1 inline-block rotate-1 rounded-md border-2 border-black px-1.5 py-0.5">
                PRINT
              </span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm font-medium text-black/65">
            Self-service printing kiosks for documents, photos and school work. Print anything, anytime — pay at
            the kiosk.
          </p>
        </div>

        <nav aria-label="Printing">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">Printing</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li><Link className="hover:underline" href="/how-it-works">How it works</Link></li>
            <li><Link className="hover:underline" href="/pricing">Pricing</Link></li>
            <li><Link className="hover:underline" href="/locations">Find a kiosk</Link></li>
            <li><Link className="hover:underline" href="/download">Download kiosk app</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">Company</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li><Link className="hover:underline" href="/about">About us</Link></li>
            <li><Link className="hover:underline" href="/contact">Contact</Link></li>
            <li><Link className="hover:underline" href="/faq">FAQ</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li><Link className="hover:underline" href="/privacy">Privacy policy</Link></li>
            <li><Link className="hover:underline" href="/terms">Terms of service</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t-[3px] border-black">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs font-bold text-black/60 sm:px-6">
          <span>© {new Date().getFullYear()} Smart Print · smartprint.example</span>
          <span>Files are deleted from the kiosk after printing.</span>
        </div>
      </div>
    </footer>
  )
}
