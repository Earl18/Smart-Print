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
            <div className="mt-6 flex justify-center">
              <KCard tone="coral" className="w-full max-w-xl">
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
          </>
        ) : !state.scan.done ? (
          <>
            <SectionHeading sub="Give us a moment — we check every file so your prints come out right the first time.">
              Checking your document
            </SectionHeading>
            <div className="mt-6 flex justify-center">
              <KCard className="w-full max-w-xl">
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
          </>
        ) : (
          <>
            <SectionHeading sub="Your document passed the check. Continue to review your order.">
              Scan complete
            </SectionHeading>
            <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
              <div className="flex min-w-0">
                <KCard className="flex w-full flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 font-display text-lg font-bold sm:text-2xl">Document ready</h3>
                    {doc.images > 0 ? (
                      <StatusPill tone="info" icon={ImageIcon} className="shrink-0 px-2! py-1! text-[11px]! [&>svg]:size-4!">
                        {doc.images} {doc.images === 1 ? 'image' : 'images'} detected
                      </StatusPill>
                    ) : null}
                  </div>

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

                  <DashedDivider />

                  <KeyVal k="File name" v={doc.name} vClassName="min-w-0 max-w-[240px] truncate font-mono" />
                  <KeyVal k="Type" v={kindLabel(doc.kind)} />
                  <KeyVal k="Size" v={formatBytes(doc.sizeBytes)} />
                  <KeyVal k="Pages" v={pages} />
                  <KeyVal k="Images" v={doc.images} />

                  <div className="mt-auto grid grid-cols-1 gap-3 pt-6 min-[480px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <KButton tone="lime" full icon={ArrowRight} className="px-3!" onClick={() => dispatch({ type: 'SCAN_NEXT' })}>
                      Continue
                    </KButton>
                    <KButton tone="white" full icon={RefreshCcw} className="gap-1.5! px-2! text-sm! [&>svg]:size-5!" onClick={() => dispatch({ type: 'REPLACE_FILE' })}>
                      Replace file
                    </KButton>
                  </div>
                </KCard>
              </div>
              <PriceSummary className="h-full w-full" />
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
