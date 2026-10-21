import type { Metadata } from 'next'
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Download,
  HardDrive,
  KeyRound,
  MemoryStick,
  Monitor,
  Printer,
  Wrench,
} from 'lucide-react'
import { siteContent } from '@/lib/data/db'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'

export const metadata: Metadata = { title: 'Download the kiosk app' }

const REQUIREMENTS = [
  { icon: Monitor, label: 'Windows 10 or 11, 64-bit' },
  { icon: MemoryStick, label: '4 GB RAM' },
  { icon: HardDrive, label: '500 MB free disk space' },
  { icon: Printer, label: 'Supported printer + cash acceptor' },
  { icon: Monitor, label: 'Screen from 600 px to 1920 px' },
] as const

const INSTALL_STEPS = [
  {
    title: 'Download',
    text: 'Get the installer above and save it on the kiosk PC.',
  },
  {
    title: 'Run the installer',
    text: 'Open the downloaded setup file and allow it to install.',
  },
  {
    title: 'Follow the setup wizard',
    text: 'Connect the network, enter your license key, and let the device check verify printer, paper and cash acceptor.',
  },
  {
    title: 'Start kiosk',
    text: 'Finish the wizard and the kiosk opens on the welcome screen, ready for customers.',
  },
] as const

export default function DownloadPage() {
  const dl = siteContent.download
  const released = new Date(dl.releasedAt).toISOString().slice(0, 10)

  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge tone="lime">Kiosk app</Badge>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Run Smart Print on your own kiosk PC.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
                The same full-screen kiosk software our fleet runs — install it on a Windows PC with a
                supported printer and cash acceptor, or try it right now in your browser.
              </p>

              {/* Two clear actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <NBButton
                  href="/kiosk"
                  size="lg"
                  tone="lime"
                  icon={<ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />}
                >
                  Open the kiosk app
                </NBButton>
                <NBButton
                  href={`/downloads/${dl.fileName}`}
                  external
                  download
                  size="lg"
                  tone="white"
                  icon={<Download className="size-5" strokeWidth={2.5} aria-hidden />}
                >
                  Download for Windows
                </NBButton>
              </div>
              <p className="mt-4 text-sm font-bold text-black/55">
                No Windows PC at hand? The kiosk also runs full-screen in any modern browser — tap
                “Open the kiosk app” above.
              </p>
            </div>

            {/* Release info card */}
            <StickerCard tone="blue" rotate={1.2} className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="white">Version {dl.version}</Badge>
                <Badge tone="lime">{dl.fileSizeMb} MB installer</Badge>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold sm:text-2xl">Release notes</h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-black/55">
                Released {released}
              </p>
              <ul className="mt-4 space-y-3">
                {dl.releaseNotes.map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-3 rounded-xl border-[3px] border-black bg-white px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                    <span className="text-sm font-bold sm:text-[15px]">{note}</span>
                  </li>
                ))}
              </ul>
            </StickerCard>
          </div>
        </div>
      </section>

      {/* System requirements */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">System requirements</h2>
          <p className="mt-2 font-medium text-black/65">
            What the kiosk PC needs before the setup wizard will run.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REQUIREMENTS.map((req) => (
              <li key={req.label}>
                <StickerCard className="flex items-center gap-4 p-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-kblue">
                    <req.icon className="size-6" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="font-semibold">{req.label}</span>
                </StickerCard>
              </li>
            ))}
            <li>
              <StickerCard className="flex items-center gap-4 p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-klime">
                  <Banknote className="size-6" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-semibold">
                  Internet recommended for QR upload and e-wallet payments
                </span>
              </StickerCard>
            </li>
          </ul>
        </div>
      </section>

      {/* Install guide */}
      <section className="bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Install guide</h2>
          <p className="mt-2 font-medium text-black/65">
            Four steps from installer to a running kiosk.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INSTALL_STEPS.map((step, i) => (
              <li key={step.title}>
                <StickerCard className="flex h-full flex-col gap-3 p-5">
                  <span className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl border-[3px] border-black bg-white">
                      {i === 0 ? (
                        <Download className="size-6" strokeWidth={2.5} aria-hidden />
                      ) : i === 1 ? (
                        <Wrench className="size-6" strokeWidth={2.5} aria-hidden />
                      ) : i === 2 ? (
                        <KeyRound className="size-6" strokeWidth={2.5} aria-hidden />
                      ) : (
                        <CheckCircle2 className="size-6" strokeWidth={2.5} aria-hidden />
                      )}
                    </span>
                    <span className="font-display text-3xl font-bold text-black/15">{i + 1}</span>
                  </span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="text-sm font-medium text-black/65">{step.text}</p>
                </StickerCard>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl rounded-2xl border-[3px] border-black bg-white p-5 font-semibold text-black/75 shadow-[5px_5px_0_#000]">
            Tip: the setup wizard resumes exactly where it stopped after a power cut, and paid jobs are
            kept as held transactions — so restarting mid-setup is always safe.
          </p>
        </div>
      </section>
    </>
  )
}
