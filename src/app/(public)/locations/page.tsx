'use client'

import { useMemo, useState } from 'react'
import { FileX2, MapPin, Search, SearchX, Wifi, WifiOff } from 'lucide-react'
import { locations } from '@/lib/data/db'
import type { KioskLocation } from '@/lib/data/types'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard, StatusPill } from '@/components/site/primitives'

function OnlinePill({ online }: { online: boolean }) {
  return online ? (
    <StatusPill tone="ok" icon={Wifi}>
      Online
    </StatusPill>
  ) : (
    <StatusPill tone="error" icon={WifiOff}>
      Offline
    </StatusPill>
  )
}

function PaperPill({ paper }: { paper: KioskLocation['paper'] }) {
  return paper === 'ok' ? (
    <StatusPill tone="ok" icon={MapPin}>
      Paper ready
    </StatusPill>
  ) : (
    <StatusPill tone="warn" icon={MapPin}>
      Paper low
    </StatusPill>
  )
}

export default function LocationsPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return locations
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(needle) || loc.address.toLowerCase().includes(needle),
    )
  }, [query])

  return (
    <>
      {/* Hero */}
      <section className="border-b-[3px] border-black bg-kpaper">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge tone="lime">Locations</Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Find a kiosk near you.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium text-black/70 sm:text-lg">
            Kiosks sit in transit stations, parks and city centers across Metro Manila, Cebu, Davao and
            Iloilo — with live status for each one.
          </p>

          <div className="mt-8 max-w-xl">
            <label htmlFor="location-search" className="mb-2 block font-display text-sm font-bold uppercase tracking-wide">
              Search by name or address
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/50"
                strokeWidth={2.5}
                aria-hidden
              />
              <input
                id="location-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “Makati” or “Cebu”…"
                className="kb-input pl-12!"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location cards */}
      <section className="border-b-[3px] border-black bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-5">
          <div className="mb-5 flex justify-end" aria-live="polite">
            <Badge tone="white" className="text-sm">
              {filtered.length} of {locations.length} locations
            </Badge>
          </div>
          {filtered.length === 0 ? (
            <StickerCard tone="cream" className="mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center">
              <span className="flex size-16 items-center justify-center rounded-full border-[3px] border-black bg-white">
                <SearchX className="size-8" strokeWidth={2.5} aria-hidden />
              </span>
              <h2 className="font-display text-2xl font-bold">No kiosks match your search</h2>
              <p className="font-medium text-black/65">
                We could not find a location for “{query.trim()}”. Try a city name like Quiapo, Cebu or
                Davao.
              </p>
              <NBButton onClick={() => setQuery('')} tone="white">
                Clear the search
              </NBButton>
            </StickerCard>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((loc) => (
                <li key={loc.id}>
                  <StickerCard className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-xl font-bold">{loc.name}</h2>
                      <OnlinePill online={loc.online} />
                    </div>
                    <p className="flex items-start gap-2 text-sm font-medium text-black/65">
                      <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                      {loc.address}
                    </p>
                    <p className="text-sm font-semibold text-black/75">{loc.hours}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                      <PaperPill paper={loc.paper} />
                    </div>
                  </StickerCard>
                </li>
              ))}
            </ul>
          )}

          <StickerCard tone="cream" className="mt-8 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-white">
              <FileX2 className="size-6" strokeWidth={2.5} aria-hidden />
            </span>
            <p className="font-semibold text-black/75">
              Every kiosk deletes your file after printing. Nothing is stored, at any location.
            </p>
          </StickerCard>
        </div>
      </section>
    </>
  )
}
