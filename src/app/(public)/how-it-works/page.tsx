import type { Metadata } from 'next'
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  FileX2,
  KeyRound,
  MapPin,
  Power,
  Printer,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'

export const metadata: Metadata = { title: 'How it works' }

const CUSTOMER_STEPS = [
  {
    icon: SlidersHorizontal,
    title: 'Choose settings',
    text: 'Tap your paper size (A4, Letter or A3), black & white or colored, and 1–10 copies on the kiosk screen. The price updates as you choose.',
  },
  {
    icon: Smartphone,
    title: 'Send your file',
    text: 'Scan the QR code with your phone camera and upload, send over Bluetooth from a laptop, or plug in a USB drive. PDF, DOCX, JPG and PNG up to 20 MB.',
  },
  {
    icon: Banknote,
    title: 'Pay',
    text: 'Insert cash — exact amounts appreciated, excess returned by the acceptor — or scan the payment code with GCash, Maya or another e-wallet.',
  },
  {
    icon: Printer,
    title: 'Collect',
    text: 'Your pages come out in seconds. Take your prints from the tray and go. The kiosk deletes your file the moment printing finishes.',
  },
] as const

const SETUP_STEPS = [
  {
    icon: Wifi,
    title: 'Network',
    text: 'Connect the kiosk to Wi-Fi or leave it in offline mode. Online kiosks enable QR upload and e-wallet; offline kiosks keep Bluetooth, USB and cash.',
  },
  {
    icon: KeyRound,
    title: 'License',
    text: 'Enter the operator license key (XXXX-XXXX-XXXX-XXXX). The kiosk validates it against the fleet registry before continuing.',
  },
  {
    icon: ClipboardCheck,
    title: 'Device check',
    text: 'The wizard tests printer, paper level, cash acceptor, storage, Bluetooth and USB. Blocking failures stop setup; warnings can be reviewed later.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configuration',
    text: 'Published operator settings load automatically — rate card, copy limits, allowed inputs, payment methods and timers.',
  },
  {
    icon: CheckCircle2,
    title: 'Ready',
    text: 'Finish the wizard and the kiosk opens on the welcome screen, ready for the first customer.',
  },
] as const

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">How it works</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            From file to paper in about two minutes.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            Four steps for customers, a one-time wizard for kiosk operators. No accounts, no queues,
            nothing left behind.
          </p>
        </div>
      </section>

      {/* Customer walkthrough */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">For customers</h2>
          <p className="mt-2 max-w-2xl font-medium text-black/65">
            Everything happens at the kiosk — you only bring the file.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CUSTOMER_STEPS.map((step, i) => (
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
          <StickerCard tone="cream" className="mt-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-white">
              <FileX2 className="size-6" strokeWidth={2.5} aria-hidden />
            </span>
            <p className="font-semibold text-black/75">
              A note on privacy: your file is deleted from the kiosk immediately after printing.
              Nothing is kept, copied or uploaded anywhere.
            </p>
          </StickerCard>
        </div>
      </section>

      {/* Operator walkthrough */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">For kiosk operators</h2>
          <p className="mt-2 max-w-2xl font-medium text-black/65">
            First-time setup runs once on the kiosk itself and takes a few minutes.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SETUP_STEPS.map((step, i) => (
              <li key={step.title}>
                <StickerCard className="flex h-full flex-col gap-3 p-5">
                  <span className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-white">
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

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <StickerCard className="flex h-full flex-col gap-3 p-6">
              <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-kblue">
                <Power className="size-6" strokeWidth={2.5} aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold">Maintenance and reset</h3>
              <p className="text-sm font-medium text-black/65">
                Operators enter maintenance by long-pressing the logo on the top bar for three seconds,
                then typing the operator PIN. From there the kiosk can be fully reset — the setup
                wizard starts again, and any paid jobs are kept safe.
              </p>
            </StickerCard>
            <StickerCard className="flex h-full flex-col gap-3 p-6">
              <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-kcoral">
                <ShieldCheck className="size-6" strokeWidth={2.5} aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold">Power loss? Nothing is lost.</h3>
              <p className="text-sm font-medium text-black/65">
                If power is interrupted mid-transaction, the job is saved. On the next boot the kiosk
                offers to resume it, so a paid job becomes a held transaction — free retry for the
                customer, never a second payment.
              </p>
            </StickerCard>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <StickerCard tone="lime" className="flex flex-col items-center gap-5 p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              See it for yourself.
            </h2>
            <p className="max-w-xl font-semibold text-black/70">
              Open the full-screen kiosk right in your browser, or find the nearest location and print
              for real.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <NBButton
                href="/kiosk"
                size="lg"
                tone="white"
                icon={<ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}
              >
                Open the kiosk
              </NBButton>
              <NBButton
                href="/locations"
                size="lg"
                tone="dark"
                icon={<MapPin className="size-5" strokeWidth={2.5} aria-hidden />}
              >
                Find a kiosk
              </NBButton>
            </div>
          </StickerCard>
        </div>
      </section>
    </>
  )
}
