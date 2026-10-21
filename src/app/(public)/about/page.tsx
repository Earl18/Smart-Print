import type { Metadata } from 'next'
import {
  ArrowRight,
  Banknote,
  FileX2,
  MapPin,
  Printer,
  ReceiptText,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'
import { KioskLogo } from '@/kiosk/components/Logo'

export const metadata: Metadata = { title: 'About' }

const VALUES = [
  {
    icon: FileX2,
    title: 'Privacy first',
    text: 'Your file travels from your device straight to the kiosk in front of you. It is deleted the moment printing finishes — never uploaded to a cloud.',
  },
  {
    icon: ReceiptText,
    title: 'Plain pricing',
    text: 'One posted rate per page for everyone. No accounts, no subscriptions, no surge — the price on the screen is the price you pay.',
  },
  {
    icon: Printer,
    title: 'Reliable hardware',
    text: 'Commercial-grade printers, cash acceptors and paper sensors, checked remotely every few minutes so a kiosk never surprises you.',
  },
  {
    icon: MapPin,
    title: 'Print anywhere',
    text: 'Kiosks live where students and workers already are — transit stations, campuses, malls — open early and often around the clock.',
  },
] as const

const TEAM = [
  { name: 'Ana Reyes', role: 'Chief Executive' },
  { name: 'Marco Dela Cruz', role: 'Kiosk Operations Lead' },
  { name: 'Lia Santos', role: 'Regional Kiosk Operator' },
  { name: 'Bea Lim', role: 'Support & Refunds Lead' },
] as const

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">About Smart Print</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Printers where people{' '}
            <span className="kb-lime inline-block -rotate-1 rounded-xl border-[3px] border-black px-3">
              already are.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            Smart Print puts self-service printing kiosks in the places students and workers pass
            through every day — so printing takes minutes, not a special trip.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Our story</h2>
            <p className="mt-2 font-medium text-black/65">
              Started in Manila after one too many 11 PM print-shop queues.
            </p>
            <div className="mt-6 max-w-3xl space-y-4 font-medium text-black/75">
              <p>
                Smart Print began in 2024 with a simple observation: nobody needs a print shop — they
                need a printer at the moment they need one. Students rushing a paper before class and
                workers printing a form before a meeting were both walking out of their way, then
                waiting in line, for two pages.
              </p>
              <p>
                So we built the opposite: a kiosk that stands where foot traffic already flows. Send a
                file from your phone over QR or Bluetooth, or plug in a USB drive. Choose paper, color
                and copies on the spot. Pay with cash or e-wallet. Collect your prints and go — your
                file is deleted the second the last page lands in the tray.
              </p>
              <p>
                Today kiosks run across Metro Manila, Cebu and Davao, with more added as operators join
                the network. Every kiosk is checked for paper, toner, cash and connectivity around the
                clock, because a printer you cannot trust is not worth walking to.
              </p>
            </div>
          </div>
          <StickerCard tone="blue" rotate={1.2} className="p-6 sm:p-8">
            <span className="flex size-14 items-center justify-center rounded-xl border-[3px] border-black bg-white">
              <KioskLogo className="size-10" alt="" />
            </span>
            <blockquote className="mt-4 font-display text-xl font-bold leading-snug sm:text-2xl">
              “A printer you pass on the way, not a trip you plan around.”
            </blockquote>
            <p className="mt-3 text-sm font-semibold text-black/70">
              — the note our first kiosk was sketched on, Quiapo, 2024
            </p>
          </StickerCard>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <StickerCard tone="lime" className="flex flex-col items-start gap-4 p-6 sm:p-10">
            <span className="flex size-14 items-center justify-center rounded-xl border-[3px] border-black bg-white">
              <Target className="size-7" strokeWidth={2.5} aria-hidden />
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Our mission</h2>
            <p className="max-w-3xl text-lg font-semibold text-black/75">
              Make printing as ordinary as buying water: walk up, pay the posted price, walk away with
              your pages — while keeping your documents on your device and in your hands, and nowhere
              else.
            </p>
          </StickerCard>
        </div>
      </section>

      {/* Values */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What we stand for</h2>
          <p className="mt-2 font-medium text-black/65">Four rules every kiosk and every teammate works by.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <li key={v.title}>
                <StickerCard className="flex h-full flex-col gap-3 p-5">
                  <span className="flex size-12 items-center justify-center self-start rounded-xl border-[3px] border-black bg-klime">
                    <v.icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <h3 className="font-display text-lg font-bold">{v.title}</h3>
                  <p className="text-sm font-medium text-black/65">{v.text}</p>
                </StickerCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">The team</h2>
          <p className="mt-2 font-medium text-black/65">
            The people keeping the fleet printing — from the head office to the kiosk floor.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member, i) => (
              <li key={member.name}>
                <StickerCard rotate={i % 2 === 0 ? -1 : 1} className="flex h-full flex-col gap-3 p-5">
                  <span className="flex size-12 items-center justify-center rounded-full border-[3px] border-black bg-white font-display text-lg font-bold">
                    {member.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{member.name}</h3>
                    <p className="text-sm font-semibold text-black/65">{member.role}</p>
                  </div>
                </StickerCard>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-black/60">
            <Banknote className="size-4" aria-hidden />
            Operator-run kiosks are the backbone of the network — want to host or run one?
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Come see a kiosk for yourself.
              </h2>
              <p className="mt-2 font-medium text-black/65">
                Six locations across Metro Manila, Cebu, Davao and Iloilo — check live status before you go.
              </p>
            </div>
            <NBButton
              href="/locations"
              size="lg"
              icon={<ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}
            >
              Find a kiosk near you
            </NBButton>
          </div>
        </div>
      </section>
    </>
  )
}
