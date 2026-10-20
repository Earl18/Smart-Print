'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Image as ImageIcon, RefreshCcw, ScanSearch, TriangleAlert } from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import {
  DashedDivider,
  IconBadge,
  KButton,
  KCard,
  KeyVal,
  ProgressBar,
  SectionHeading,
  StatusPill,
} from '@/kiosk/components/primitives'
import { PriceSummary } from '@/kiosk/components/PriceSummary'
import { formatBytes, kindLabel } from '@/kiosk/lib/format'

export function ScanScreen() {
  const { state, dispatch } = useKiosk()
  const doc = state.doc

  if (!doc) return null

  const pages = doc.pages
  const shownPages = Math.min(6, pages)

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {state.scan.done && state.unreadableReason ? (
          <>
            <SectionHeading sub="Nothing was charged. Replace the file or cancel — you can always start again.">
              We couldn&rsquo;t read your file
            </SectionHeading>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
              <div>
                <KCard tone="coral" className="mx-auto w-full max-w-xl">
                  <StatusPill tone="error" icon={TriangleAlert}>
                    File could not be read
                  </StatusPill>
                  <p className="mt-4 text-base font-semibold sm:text-lg">{state.unreadableReason}</p>
                  <p
                    className="mt-4 break-all rounded-xl border-[3px] border-black bg-white px-3 py-2 font-mono text-sm font-bold"
                    title={doc.name}
                  >
                    {doc.name}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <KButton tone="lime" icon={RefreshCcw} onClick={() => dispatch({ type: 'REPLACE_FILE' })}>
                      Replace file
                    </KButton>
                    <KButton tone="white" onClick={() => dispatch({ type: 'REVIEW_CANCEL' })}>
                      Cancel
                    </KButton>
                  </div>
                </KCard>
              </div>
              <PriceSummary className="w-full" />
            </div>
          </>
        ) : !state.scan.done ? (
          <>
            <SectionHeading sub="Give us a moment — we check every file so your prints come out right the first time.">
              Checking your document
            </SectionHeading>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
              <div>
                <KCard className="mx-auto w-full max-w-xl">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <IconBadge icon={ScanSearch} tone="lime" size="lg" />
                    <h3 className="font-display text-2xl font-bold sm:text-3xl">Scanning your document…</h3>
                    <p
                      className="w-full truncate rounded-xl border-[3px] border-black bg-white px-3 py-2 font-mono text-sm font-bold"
                      title={doc.name}
                    >
                      {doc.name}
                    </p>
                    <div className="w-full">
                      <ProgressBar value={state.scan.progress} label="Scan progress" />
                      <p className="mt-3 font-display text-xl font-bold">{state.scan.progress}% complete</p>
                    </div>
                  </div>
                </KCard>
              </div>
              <PriceSummary className="w-full" />
            </div>
          </>
        ) : (
          <>
            <SectionHeading sub="Your document passed the check. Continue to review your order.">
              Scan complete
            </SectionHeading>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
              <div>
                <KCard>
                  <h3 className="font-display text-2xl font-bold">Document ready</h3>

                  {/* Page preview strip */}
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {Array.from({ length: shownPages }, (_, i) => (
                      <div
                        key={i}
                        className="kb-card-flat flex aspect-[3/4] items-center justify-center font-display text-lg font-bold"
                      >
                        {i + 1}
                      </div>
                    ))}
                    {pages > 6 ? (
                      <div className="kb-card-flat kb-cream flex aspect-[3/4] items-center justify-center font-display text-lg font-bold">
                        +{pages - 6}
                      </div>
                    ) : null}
                  </div>

                  {doc.images > 0 ? (
                    <div className="mt-4">
                      <StatusPill tone="info" icon={ImageIcon}>
                        {doc.images} images detected
                      </StatusPill>
                    </div>
                  ) : null}

                  <DashedDivider />

                  <KeyVal k="File name" v={doc.name} vClassName="min-w-0 max-w-[240px] truncate font-mono" />
                  <KeyVal k="Type" v={kindLabel(doc.kind)} />
                  <KeyVal k="Size" v={formatBytes(doc.sizeBytes)} />
                  <KeyVal k="Pages" v={pages} />
                  <KeyVal k="Images" v={doc.images} />

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <KButton tone="lime" icon={ArrowRight} onClick={() => dispatch({ type: 'SCAN_NEXT' })}>
                      Continue
                    </KButton>
                    <KButton tone="white" icon={RefreshCcw} onClick={() => dispatch({ type: 'REPLACE_FILE' })}>
                      Replace file
                    </KButton>
                  </div>
                </KCard>
              </div>
              <PriceSummary className="w-full" />
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
