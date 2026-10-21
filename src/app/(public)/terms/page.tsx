import type { Metadata } from 'next'
import { RATES } from '@/kiosk/lib/pricing'
import { Badge } from '@/components/site/primitives'

export const metadata: Metadata = { title: 'Terms of service' }

const SECTIONS = [
  {
    title: 'Using the kiosks',
    body: (
      <>
        <p>
          Smart Print kiosks are self-service. By starting a job you agree to choose your settings
          carefully before paying: paper size (A4, Letter or A3), color mode, and 1 to 10 copies per
          job. The settings you confirm on screen are the settings that print.
        </p>
        <p>
          You may send files by QR upload from a phone, Bluetooth from a laptop, or a USB drive, in
          supported formats (PDF, DOCX, JPG, PNG) up to 20 MB. QR upload and e-wallet payment require
          the kiosk to be online; Bluetooth, USB and cash work even when it is not.
        </p>
      </>
    ),
  },
  {
    title: 'Prices and payment',
    body: (
      <>
        <p>
          Prices are per page and shown on the kiosk before you pay: A4 and Letter cost ₱
          {RATES.A4.bw} per page in black &amp; white and ₱{RATES.A4.color} in color; A3 costs ₱
          {RATES.A3.bw} per page in black &amp; white and ₱{RATES.A3.color} in color. The total is the
          per-copy price (pages × price per page) multiplied by the number of copies.
        </p>
        <p>
          Payment is due in full before printing starts. Cash payments: exact amounts are appreciated
          and any excess is returned by the acceptor. E-wallet payments: you confirm the exact amount
          in your wallet app against the job reference.
        </p>
      </>
    ),
  },
  {
    title: 'Refunds and held transactions',
    body: (
      <>
        <p>
          If a paid job fails to print — a paper jam, paper out, power interruption, or another fault —
          the job is kept at the kiosk as a held transaction together with your payment. You never pay
          twice for the same pages.
        </p>
        <p>
          A held job can be retried at the kiosk free of charge once the fault is cleared, or refunded:
          ask our staff at the location or report it from the kiosk screen. Cash refunds are returned at
          the kiosk; e-wallet refunds go back through your wallet using the original payment reference.
        </p>
        <p>
          If you cancel before payment, nothing is charged and nothing is owed — unpaid jobs are simply
          discarded.
        </p>
      </>
    ),
  },
  {
    title: 'File handling',
    body: (
      <>
        <p>
          Your file is sent directly to the kiosk you are using and is deleted from the kiosk
          immediately after printing. No copy is stored in the cloud or on our servers.
        </p>
        <p>
          Do not leave USB drives behind, and double-check the file before confirming — we cannot be
          responsible for the contents you choose to print, or for documents left in the output tray by
          anyone. Take your prints with you.
        </p>
      </>
    ),
  },
  {
    title: 'Acceptable use',
    body: (
      <>
        <p>
          Kiosks may not be used to print material that is illegal in the Philippines, or to attempt to
          damage, overload, tamper with or bypass the kiosk hardware, software, payment systems or
          operator controls. Operator functions — maintenance, reset, configuration — are protected by
          an operator PIN and are off-limits to customers.
        </p>
        <p>
          We may refuse or stop a job, and involve location staff or authorities, where these rules are
          breached.
        </p>
      </>
    ),
  },
  {
    title: 'Liability',
    body: (
      <>
        <p>
          Our responsibility for any job is limited to what you paid for it: a free retry or a refund of
          the amount paid, as described above. We are not liable for indirect losses — for example a
          missed deadline caused by a print you chose to make at the last minute.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited under Philippine law.
        </p>
      </>
    ),
  },
  {
    title: 'Changes',
    body: (
      <>
        <p>
          We may update these terms as the service grows. The current version is always published on
          this page, and rate changes take effect only when posted on the kiosk itself — the price on
          the screen in front of you is the price that applies to your job.
        </p>
      </>
    ),
  },
] as const

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">Terms of service</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Fair terms, in plain language.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            What you can expect from every kiosk, and what we expect from you. Seven short sections — no
            fine print traps.
          </p>
        </div>
      </section>

      {/* Numbered sections */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <ol className="space-y-10">
            {SECTIONS.map((section, i) => (
              <li key={section.title}>
                <article>
                  <h2 className="flex items-baseline gap-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border-[3px] border-black bg-klime font-display text-base font-bold tabular-nums">
                      {i + 1}
                    </span>
                    {section.title}
                  </h2>
                  <div className="mt-4 max-w-3xl space-y-4 pl-0 font-medium text-black/75 sm:pl-12">
                    {section.body}
                  </div>
                </article>
              </li>
            ))}
          </ol>

          <p className="mt-12 rounded-2xl border-[3px] border-black bg-kpaper p-5 text-sm font-semibold text-black/70 shadow-[5px_5px_0_#000]">
            Questions about these terms? Contact us through the website — our team replies within one
            working day.
          </p>
        </div>
      </section>
    </>
  )
}
