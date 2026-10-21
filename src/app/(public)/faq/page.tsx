'use client'

import { useState } from 'react'
import { ChevronDown, MessageSquareText } from 'lucide-react'
import { faq } from '@/lib/data/db'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'

export default function FaqPage() {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(['faq-1']))

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">FAQ</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Questions, answered.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            The eight things people ask at the kiosk most often. Tap a question to open it — open as
            many as you like.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <ul className="space-y-4">
            {faq.map((item) => {
              const open = openIds.has(item.id)
              const panelId = `faq-panel-${item.id}`
              const buttonId = `faq-button-${item.id}`
              return (
                <li key={item.id}>
                  <StickerCard as="article" className="overflow-hidden">
                    <h2>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => toggle(item.id)}
                        className="flex min-h-14 w-full items-center justify-between gap-4 p-5 text-left"
                      >
                        <span className="font-display text-base font-bold sm:text-lg">{item.question}</span>
                        <ChevronDown
                          className={`size-6 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      </button>
                    </h2>
                    {open ? (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="border-t-2 border-black/15 px-5 pb-5 pt-4"
                      >
                        <p className="font-medium text-black/75">{item.answer}</p>
                      </div>
                    ) : null}
                  </StickerCard>
                </li>
              )
            })}
          </ul>

          {/* Contact CTA */}
          <StickerCard tone="lime" className="mt-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-white">
                <MessageSquareText className="size-6" strokeWidth={2.5} aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold sm:text-2xl">Still stuck on something?</h2>
                <p className="mt-1 font-semibold text-black/70">
                  Send us a message — our team replies within one working day.
                </p>
              </div>
            </div>
            <NBButton href="/contact" size="lg" tone="white" className="shrink-0">
              Contact us
            </NBButton>
          </StickerCard>
        </div>
      </section>
    </>
  )
}
