import type { Metadata } from 'next'
import {
  ArrowRight,
  Banknote,
  FileX2,
  RefreshCw,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { PAPER_SIZES, RATES, perPageRate } from '@/kiosk/lib/pricing'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'

export const metadata: Metadata = { title: 'Pricing' }

/* Worked example straight from the rate card: 3 pages black & white A4. */
const EXAMPLE_PAGES = 3
const EXAMPLE_COPIES = 2
const examplePerPage = perPageRate('A4', 'bw') // ₱5
const examplePerCopy = examplePerPage * EXAMPLE_PAGES // ₱15
const exampleTotal = examplePerCopy * EXAMPLE_COPIES // ₱30

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">Pricing</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            One price per page. Posted on every kiosk.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            No accounts, no minimums, no hidden fees. The kiosk shows the exact total before you pay a
            single peso.
          </p>
        </div>
      </section>

      {/* Rate cards */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Rate card</h2>
          <p className="mt-2 font-medium text-black/65">
            Per-page prices for every paper size and color mode, straight from the kiosk configuration.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PAPER_SIZES.map((size) => (
              <li key={size.id}>
                <StickerCard className="flex h-full flex-col p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-2xl font-bold">{size.label}</h3>
                    <span className="text-sm font-semibold text-black/55">{size.dims}</span>
                  </div>
                  <dl className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border-2 border-black bg-kpaper px-4 py-3">
                      <dt className="text-sm font-bold">Black &amp; white</dt>
                      <dd className="font-display text-xl font-bold tabular-nums">
                        ₱{RATES[size.id].bw}
                        <span className="text-xs font-bold text-black/55"> /page</span>
                      </dd>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border-2 border-black bg-kpaper px-4 py-3">
                      <dt className="text-sm font-bold">Colored</dt>
                      <dd className="font-display text-xl font-bold tabular-nums">
                        ₱{RATES[size.id].color}
                        <span className="text-xs font-bold text-black/55"> /page</span>
                      </dd>
                    </div>
                  </dl>
                </StickerCard>
              </li>
            ))}
          </ul>
          <p className="mt-6 inline-flex rounded-xl border-2 border-black bg-kpaper px-4 py-2 text-sm font-bold">
            1 to 10 copies of the same document per job — need more? Just start a second job.
          </p>
        </div>
      </section>

      {/* Worked example */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How the total is computed</h2>
          <p className="mt-2 max-w-2xl font-medium text-black/65">
            Pages per copy first, then copies — exactly what the kiosk screen shows before payment.
          </p>
          <StickerCard className="mt-8 max-w-3xl p-6 sm:p-8">
            <p className="font-semibold text-black/75">
              Example: {EXAMPLE_PAGES} pages, black &amp; white, A4 at ₱{examplePerPage} per page.
            </p>
            <p className="mt-4 font-display text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
              ₱{examplePerCopy} per copy × {EXAMPLE_COPIES} copies = ₱{exampleTotal}
            </p>
            <p className="mt-4 text-sm font-medium text-black/65">
              Per copy = price per page × number of pages. Total = price per copy × copies. The same
              math runs on every kiosk, for every paper size.
            </p>
          </StickerCard>
        </div>
      </section>

      {/* Payments */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Accepted payments</h2>
          <p className="mt-2 font-medium text-black/65">Cash or e-wallet — both shown on the kiosk before you pay.</p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <StickerCard className="flex h-full flex-col gap-3 p-6">
              <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-klime">
                <Banknote className="size-6" strokeWidth={2.5} aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold">Cash</h3>
              <p className="text-sm font-medium text-black/65">
                Insert bills into the acceptor. Exact amounts are appreciated, and any excess is
                returned by the acceptor — the kiosk shows the change on screen before printing starts.
              </p>
            </StickerCard>
            <StickerCard className="flex h-full flex-col gap-3 p-6">
              <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-kblue">
                <Smartphone className="size-6" strokeWidth={2.5} aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold">E-wallet</h3>
              <p className="text-sm font-medium text-black/65">
                Scan the payment code with GCash, Maya or another e-wallet. You confirm the exact
                amount in your wallet app — no card details ever touch the kiosk.
              </p>
            </StickerCard>
          </div>
        </div>
      </section>

      {/* Refund & excess policy */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            If printing fails, you never pay twice
          </h2>
          <p className="mt-2 max-w-2xl font-medium text-black/65">
            Faults happen — jams, paper runs, power cuts. Here is exactly what happens to your money.
          </p>
          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            <li>
              <StickerCard className="flex h-full flex-col gap-3 p-5">
                <span className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-white">
                    <FileX2 className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="font-display text-3xl font-bold text-black/15">1</span>
                </span>
                <h3 className="font-display text-lg font-bold">Job kept, not charged again</h3>
                <p className="text-sm font-medium text-black/65">
                  If printing fails after payment, your job stays at the kiosk as a held transaction —
                  payment included.
                </p>
              </StickerCard>
            </li>
            <li>
              <StickerCard className="flex h-full flex-col gap-3 p-5">
                <span className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-klime">
                    <RefreshCw className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="font-display text-3xl font-bold text-black/15">2</span>
                </span>
                <h3 className="font-display text-lg font-bold">Free retry</h3>
                <p className="text-sm font-medium text-black/65">
                  Retry the same job at no cost once the fault is cleared — the kiosk resumes where it
                  stopped.
                </p>
              </StickerCard>
            </li>
            <li>
              <StickerCard className="flex h-full flex-col gap-3 p-5">
                <span className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-kblue">
                    <Wallet className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="font-display text-3xl font-bold text-black/15">3</span>
                </span>
                <h3 className="font-display text-lg font-bold">Or a full refund</h3>
                <p className="text-sm font-medium text-black/65">
                  Prefer your money back? Ask our staff or use the kiosk report screen — refunds are
                  processed for the full amount.
                </p>
              </StickerCard>
            </li>
          </ol>
        </div>
      </section>

      {/* Compare paper sizes */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Compare paper sizes</h2>
          <p className="mt-2 font-medium text-black/65">
            All three sizes are available at every kiosk.
          </p>
          <div className="mt-8 max-w-3xl overflow-x-auto rounded-2xl border-[3px] border-black bg-white shadow-[5px_5px_0_#000]">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Price per page by paper size and color mode</caption>
              <thead>
                <tr className="border-b-[3px] border-black bg-kpaper">
                  <th scope="col" className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide">
                    Paper size
                  </th>
                  <th scope="col" className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide">
                    Dimensions
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-display text-xs font-bold uppercase tracking-wide">
                    Black &amp; white
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-display text-xs font-bold uppercase tracking-wide">
                    Colored
                  </th>
                </tr>
              </thead>
              <tbody>
                {PAPER_SIZES.map((size) => (
                  <tr key={size.id} className="border-b-2 border-black/15 last:border-b-0">
                    <th scope="row" className="px-4 py-3 font-display font-bold">
                      {size.label}
                    </th>
                    <td className="px-4 py-3 font-medium text-black/70">{size.dims}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">₱{perPageRate(size.id, 'bw')}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">₱{perPageRate(size.id, 'color')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border-[3px] border-black bg-klime p-6 shadow-[5px_5px_0_#000] sm:flex-row sm:items-center">
            <p className="max-w-xl font-semibold text-black/80">
              Ready to print at these prices? Find the kiosk nearest you — every location shows live
              status.
            </p>
            <NBButton
              href="/locations"
              size="lg"
              tone="white"
              icon={<ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}
            >
              Find a kiosk
            </NBButton>
          </div>
        </div>
      </section>
    </>
  )
}
