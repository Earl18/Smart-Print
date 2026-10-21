import type { Metadata } from 'next'
import { Badge } from '@/components/site/primitives'

export const metadata: Metadata = { title: 'Privacy policy' }

const TOC = [
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'file-handling', label: 'File handling and deletion' },
  { id: 'payments', label: 'Payments' },
  { id: 'kiosk-operations', label: 'Kiosk operations' },
  { id: 'childrens-privacy', label: "Children's privacy" },
  { id: 'changes', label: 'Changes to this policy' },
  { id: 'contact', label: 'Contact us' },
] as const

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t-2 border-black/10 pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-4 max-w-3xl space-y-4 font-medium text-black/75">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">Privacy policy</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Your file stays yours.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            This policy explains exactly what Smart Print collects, what it never collects, and how long
            anything lasts. Short version: your document goes to the kiosk, gets printed, and is deleted.
          </p>
        </div>
      </section>

      {/* Policy body with sticky TOC */}
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
          {/* Sticky TOC — hidden on phones */}
          <aside className="hidden lg:block">
            <nav aria-label="Policy sections" className="sticky top-24">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-black/55">
                On this page
              </p>
              <ul className="mt-3 space-y-1">
                {TOC.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-black/70 hover:bg-klime/40 hover:text-black"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="space-y-12">
            <Section id="what-we-collect" title="What we collect">
              <p>
                Smart Print is built to need as little from you as possible. You do not create an
                account, and we do not ask for your name, phone number or email to print.
              </p>
              <p>
                When you use a kiosk, the kiosk records the operational details of the job: the
                document type, number of pages, paper size, color mode, number of copies, the amount
                paid, and a short transaction reference. This is what appears on receipts and lets us
                honor retries and refunds. We do not read, index or profile the contents of your
                documents.
              </p>
              <p>
                If you contact us through the website form, we keep the name, email, topic and message
                you submitted so our team can reply — and nothing more.
              </p>
            </Section>

            <Section id="file-handling" title="File handling and deletion">
              <p>
                Files go directly to the kiosk you are standing at. When you upload from your phone via
                QR code, send over Bluetooth, or plug in a USB drive, the document travels straight to
                that kiosk — it is not routed through cloud storage and no copy is kept online.
              </p>
              <p>
                The kiosk deletes your file immediately after printing finishes. Once the last page
                lands in the tray, the document is removed from the kiosk&apos;s memory and storage. We
                never sell, share, train on, or otherwise process the contents of your documents.
              </p>
              <p>
                The only case a file lingers is a fault: if printing fails after payment, the job is
                kept as a held transaction so you can retry it free or request a refund. Held jobs are
                kept only long enough to be retried or refunded, then deleted.
              </p>
            </Section>

            <Section id="payments" title="Payments">
              <p>
                Cash payments are handled entirely by the kiosk&apos;s cash acceptor. The acceptor
                counts the bills you insert and returns any excess; Smart Print does not receive your
                identity with a cash payment — only the amount and the job reference.
              </p>
              <p>
                E-wallet payments (GCash, Maya and others) are confirmed through your wallet&apos;s
                payment reference only. The kiosk never sees your wallet login, card numbers, PIN or
                balance — your wallet app tells the kiosk that the amount was paid, tied to the job
                reference, and that is all we keep.
              </p>
            </Section>

            <Section id="kiosk-operations" title="Kiosk operations">
              <p>
                Kiosks keep a small amount of session data in the browser or device storage (cookies and
                localStorage) for one purpose: recovering your transaction if the session or power is
                interrupted. This lets the kiosk offer to resume a paid job instead of charging you
                again. Session data contains your job settings and reference — never your document
                contents — and is cleared when the session ends.
              </p>
              <p>
                Operators monitor kiosk health remotely: paper level, toner, cash acceptor, printer and
                network status. These health signals contain no customer documents or personal data.
                Maintenance and reset actions on a kiosk require an operator PIN and are logged for
                accountability.
              </p>
            </Section>

            <Section id="childrens-privacy" title="Children's privacy">
              <p>
                Smart Print kiosks are self-service and do not ask for age or identity. We do not
                knowingly collect personal information from children, because we do not collect personal
                information from anyone at the kiosk.
              </p>
              <p>
                Parents or guardians who have a question about a kiosk transaction can contact us with
                the transaction reference shown on the receipt, and we will help.
              </p>
            </Section>

            <Section id="changes" title="Changes to this policy">
              <p>
                If we change this policy, the updated version will be posted on this page with a revised
                date. If a change materially affects how your files or payment data are handled, we will
                highlight the change on the kiosk welcome screen and on this website before it takes
                effect.
              </p>
              <p>
                The commitment at the heart of this policy — files deleted after printing, nothing
                stored in the cloud — is a product principle, not a negotiable clause.
              </p>
            </Section>

            <Section id="contact" title="Contact us">
              <p>
                Questions about this policy, a transaction, or a held job? Use the contact form on this
                site and include your transaction reference if you have one. Our team replies within one
                working day.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </>
  )
}
