import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  BellRing,
  Bluetooth,
  FileX2,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Usb,
} from 'lucide-react'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'
import { KioskLogo } from '@/kiosk/components/Logo'
import { faq } from '@/lib/data/db'

const STEPS = [
  {
    icon: QrCode,
    title: 'Choose settings',
    text: 'Pick your paper size, black & white or colored, and the number of copies on the kiosk screen.',
  },
  {
    icon: Smartphone,
    title: 'Send your file',
    text: 'Scan the QR code and upload from your phone, send over Bluetooth, or plug in a USB drive.',
  },
  {
    icon: Banknote,
    title: 'Pay',
    text: 'Insert cash — exact amounts appreciated, overpayments returned — or pay by e-wallet.',
  },
  {
    icon: ArrowRight,
    title: 'Collect',
    text: 'Your pages come out in seconds. Take your prints and go — the file is deleted after printing.',
  },
] as const

const FEATURES = [
  {
    icon: QrCode,
    title: 'QR · Bluetooth · USB',
    text: 'Three ways to send files — no app needed for any of them.',
    tone: 'lime' as const,
    rotate: -1.5,
  },
  {
    icon: Banknote,
    title: 'Cash and e-wallet',
    text: 'Exact amounts appreciated. Excess cash is returned by the acceptor.',
    tone: 'blue' as const,
    rotate: 1.2,
  },
  {
    icon: FileX2,
    title: 'Files deleted after printing',
    text: 'Your document goes to the kiosk you are standing at — and nowhere else.',
    tone: 'white' as const,
    rotate: -1,
  },
  {
    icon: BellRing,
    title: 'Live status',
    text: 'Paper and printer state are on screen before you start. No surprises.',
    tone: 'coral' as const,
    rotate: 1.6,
  },
] as const

const STATS = [
  { value: '120+', label: 'kiosks in Metro Manila, Cebu and Davao' },
  { value: '₱5', label: 'per page for A4 black & white' },
  { value: '2 min', label: 'average time from send to print' },
  { value: '0', label: 'copies of your file kept after printing' },
] as const

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <Badge tone="lime">Self-service printing</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Print anything, anytime.
              <br />
              <span className="kb-lime inline-block -rotate-1 rounded-xl border-[3px] border-black px-3">
                Pay at the kiosk.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium text-black/70 sm:text-lg">
              Send a file from your phone or USB drive, pick your options, pay with cash or e-wallet, and
              collect your prints — no app, no queue, no account needed.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <NBButton href="/kiosk" size="lg" icon={<ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}>
                Download kiosk app
              </NBButton>
              <NBButton href="/locations" size="lg" tone="white" icon={<MapPin className="size-5" strokeWidth={2.5} aria-hidden />}>
                Find a kiosk
              </NBButton>
            </div>
            <p className="mt-4 text-sm font-bold text-black/55">
              Or open it right here — the kiosk runs full screen in your browser.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <StickerCard tone="blue" rotate={1.2} className="p-6 sm:p-8">
              <div className="flex items-center justify-center">
                <div className="flex size-36 items-center justify-center overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[6px_6px_0_#000] sm:size-44">
                  <KioskLogo className="size-full" alt="Smart Print logo" />
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {['A4, Letter and A3', 'Black & white or colored', '1 to 10 copies per job'].map((line) => (
                  <li key={line} className="flex items-center gap-3 rounded-xl border-[3px] border-black bg-white px-4 py-3">
                    <ShieldCheck className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                    <span className="text-sm font-bold sm:text-[15px]">{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Badge tone="lime" className="justify-center text-center">Ready to print</Badge>
                <Badge tone="white" className="justify-center text-center">From ₱5 per page</Badge>
              </div>
            </StickerCard>
          </div>
        </div>
      </section>

      {/* 4-step flow */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How printing works</h2>
          <p className="mt-2 max-w-2xl font-medium text-black/65">
            Four steps, about two minutes from sending your file to holding your prints.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <StickerCard className="flex h-full flex-col gap-3 p-5">
                  <span className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-klime">
                      <step.icon className="size-6" strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className="font-display text-3xl font-bold text-black/15">{i + 1}</span>
                  </span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="text-sm font-medium text-black/65">{step.text}</p>
                </StickerCard>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feature stickers */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Why people use Smart Print</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <StickerCard tone={f.tone} rotate={f.rotate} className="flex h-full flex-col gap-3 p-5">
                  <span className="flex size-12 items-center justify-center self-start rounded-xl border-[3px] border-black bg-white">
                    <f.icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="text-sm font-semibold text-black/70">{f.text}</p>
                </StickerCard>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <Badge tone="lime" className="justify-center whitespace-nowrap">
              <QrCode className="size-3.5" aria-hidden /> QR upload
            </Badge>
            <Badge tone="white" className="justify-center whitespace-nowrap">
              <Bluetooth className="size-3.5" aria-hidden /> Bluetooth
            </Badge>
            <Badge tone="white" className="justify-center whitespace-nowrap">
              <Usb className="size-3.5" aria-hidden /> USB drive
            </Badge>
            <Badge tone="blue" className="justify-center whitespace-nowrap">
              <Banknote className="size-3.5" aria-hidden /> Cash accepted
            </Badge>
            <Badge tone="blue" className="justify-center whitespace-nowrap">
              <Smartphone className="size-3.5" aria-hidden /> E-wallet
            </Badge>
            <Badge tone="coral" className="justify-center whitespace-nowrap">
              <FileX2 className="size-3.5" aria-hidden /> Nothing stored
            </Badge>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b-[3px] border-black bg-black text-white">
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-bold text-klime sm:text-4xl">{s.value}</span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-white/75 sm:text-sm">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FAQ teaser */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
            <Link
              href="/faq"
              className="font-display font-bold underline decoration-[3px] underline-offset-4 hover:bg-klime"
            >
              Read the full FAQ
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {faq.slice(0, 3).map((item) => (
              <li key={item.id}>
                <StickerCard className="h-full p-5">
                  <h3 className="font-display text-base font-bold">{item.question}</h3>
                  <p className="mt-2 text-sm font-medium text-black/65">{item.answer}</p>
                </StickerCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <StickerCard tone="lime" className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
            <KioskLogo className="size-20 sm:size-24" alt="" />
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to print? The kiosk is one tap away.
            </h2>
            <p className="max-w-xl font-semibold text-black/70">
              Open the full-screen kiosk, send a file, pay, and collect your prints.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <NBButton href="/kiosk" size="lg" tone="white" icon={<ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}>
                Open the kiosk
              </NBButton>
              <NBButton href="/locations" size="lg" tone="dark" icon={<MapPin className="size-5" strokeWidth={2.5} aria-hidden />}>
                Find a kiosk near you
              </NBButton>
            </div>
          </StickerCard>
        </div>
      </section>
    </>
  )
}
