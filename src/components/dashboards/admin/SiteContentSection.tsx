'use client'

/* Section 7 — Site content: locations, FAQ and the download section
   that the public website renders. Changes apply immediately. */

import { useState } from 'react'
import { CircleHelp, Download, Info, MapPin, Pencil, Plus, Wifi, WifiOff } from 'lucide-react'
import { Dialog } from '@/components/site/Dialog'
import { NBButton } from '@/components/site/NBButton'
import { Badge, StickerCard } from '@/components/site/primitives'
import { faq, locations, pushAudit, siteContent } from '@/lib/data/db'
import type { ComponentHealth, FaqItem, KioskLocation, PublicUser } from '@/lib/data/types'
import {
  DetailItem,
  DetailList,
  Field,
  MiniButton,
  SectionHead,
  SelectInput,
  TextArea,
  TextInput,
  fmtDate,
} from './shared'

export function SiteContentSection({ user, bump, now }: { user: PublicUser; bump: () => void; now: Date }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHead
        title="Site content"
        sub="What customers read on the public website: kiosk locations, the FAQ and the download section."
        note={
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-black/60">
            <Info className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
            Changes appear on the public site immediately.
          </p>
        }
      />

      <LocationsEditor user={user} bump={bump} />
      <FaqEditor user={user} bump={bump} />
      <DownloadEditor user={user} bump={bump} now={now} />
    </div>
  )
}

/* ---------------- (a) Locations ---------------- */

function LocationsEditor({ user, bump }: { user: PublicUser; bump: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: '', address: '', hours: '', online: true, paper: 'ok' as ComponentHealth })

  const openEditor = (loc: KioskLocation) => {
    setEditingId(loc.id)
    setDraft({ name: loc.name, address: loc.address, hours: loc.hours, online: loc.online, paper: loc.paper })
  }

  const save = () => {
    const loc = locations.find((l) => l.id === editingId)
    if (!loc) return
    loc.name = draft.name.trim() || loc.name
    loc.address = draft.address.trim()
    loc.hours = draft.hours.trim()
    loc.online = draft.online
    loc.paper = draft.paper
    pushAudit(user.name, 'site.location.update', `Updated location ${loc.name} on the public site.`)
    setEditingId(null)
    bump()
  }

  return (
    <section>
      <h3 className="flex items-center gap-2 font-display text-xl font-bold">
        <MapPin className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
        Locations
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {locations.map((loc) => (
          <li key={loc.id}>
            <StickerCard className="flex h-full flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-base font-bold">{loc.name}</h4>
                {loc.online ? (
                  <Badge tone="lime">
                    <Wifi className="size-3.5" aria-hidden /> Online
                  </Badge>
                ) : (
                  <Badge tone="coral">
                    <WifiOff className="size-3.5" aria-hidden /> Offline
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-black/70">{loc.address}</p>
              <p className="text-xs font-bold text-black/50">{loc.hours}</p>
              <div className="mt-auto flex items-center justify-between gap-2 border-t-2 border-dashed border-black/15 pt-2.5">
                <Badge tone={loc.paper === 'ok' ? 'lime' : loc.paper === 'warn' ? 'blue' : 'coral'}>
                  {loc.paper === 'ok' ? 'Paper OK' : loc.paper === 'warn' ? 'Low paper' : 'Paper out'}
                </Badge>
                <MiniButton onClick={() => openEditor(loc)} aria-label={`Edit ${loc.name}`}>
                  <Pencil className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  Edit
                </MiniButton>
              </div>
            </StickerCard>
          </li>
        ))}
      </ul>

      <Dialog
        open={editingId !== null}
        onClose={() => setEditingId(null)}
        title="Edit location"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <NBButton tone="white" onClick={() => setEditingId(null)}>
              Cancel
            </NBButton>
            <NBButton onClick={save} disabled={!draft.name.trim()}>
              Save location
            </NBButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
            <Field label="Name">
              <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Address">
              <TextInput value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            </Field>
            <Field label="Hours">
              <TextInput value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kiosk status chip">
                <button
                  type="button"
                  aria-pressed={draft.online}
                  onClick={() => setDraft({ ...draft, online: !draft.online })}
                  className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-black font-display text-sm font-bold shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000] ${
                    draft.online ? 'bg-klime' : 'bg-kcoral'
                  }`}
                >
                  {draft.online ? (
                    <>
                      <Wifi className="size-5 shrink-0" strokeWidth={2.5} aria-hidden /> Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="size-5 shrink-0" strokeWidth={2.5} aria-hidden /> Offline
                    </>
                  )}
                </button>
              </Field>
              <Field label="Paper state">
                <SelectInput
                  value={draft.paper}
                  onChange={(e) => setDraft({ ...draft, paper: e.target.value as ComponentHealth })}
                >
                  <option value="ok">Paper OK</option>
                  <option value="warn">Low paper</option>
                  <option value="failed">Paper out</option>
                </SelectInput>
              </Field>
            </div>
          </div>
      </Dialog>
    </section>
  )
}

/* ---------------- (b) FAQ ---------------- */

function FaqEditor({ user, bump }: { user: PublicUser; bump: () => void }) {
  // targetId = id of the question being edited; null = adding a new one.
  const [editing, setEditing] = useState<{ targetId: string | null; question: string; answer: string } | null>(null)

  const openExisting = (item: FaqItem) => setEditing({ targetId: item.id, question: item.question, answer: item.answer })
  const openNew = () => setEditing({ targetId: null, question: '', answer: '' })

  const save = () => {
    if (!editing) return
    const question = editing.question.trim()
    const answer = editing.answer.trim()
    if (!question || !answer) return
    if (editing.targetId) {
      const item = faq.find((f) => f.id === editing.targetId)
      if (!item) return
      item.question = question
      item.answer = answer
      pushAudit(user.name, 'site.faq.update', `Updated FAQ question "${question}".`)
    } else {
      faq.unshift({ id: `faq-${Date.now().toString(36)}`, question, answer })
      pushAudit(user.name, 'site.faq.add', `Added FAQ question "${question}".`)
    }
    setEditing(null)
    bump()
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          <CircleHelp className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
          FAQ
        </h3>
        <NBButton
          onClick={openNew}
          icon={<Plus className="size-5" strokeWidth={2.5} aria-hidden />}
          className="w-full sm:w-auto"
        >
          Add question
        </NBButton>
      </div>
      <ul className="mt-3 grid gap-3 lg:grid-cols-2">
        {faq.map((item) => (
          <li key={item.id}>
            <StickerCard className="flex h-full flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display text-base font-bold leading-snug">{item.question}</h4>
                <MiniButton onClick={() => openExisting(item)} aria-label={`Edit question: ${item.question}`} className="shrink-0">
                  <Pencil className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  Edit
                </MiniButton>
              </div>
              <p className="text-sm font-medium text-black/65">{item.answer}</p>
            </StickerCard>
          </li>
        ))}
      </ul>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.targetId ? 'Edit question' : 'Add question'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <NBButton tone="white" onClick={() => setEditing(null)}>
              Cancel
            </NBButton>
            <NBButton onClick={save} disabled={!editing?.question.trim() || !editing?.answer.trim()}>
              {editing?.targetId ? 'Save question' : 'Add question'}
            </NBButton>
          </div>
        }
      >
        {editing ? (
          <div className="flex flex-col gap-4">
            <Field label="Question">
              <TextInput
                value={editing.question}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                placeholder="Type the customer question"
              />
            </Field>
            <Field label="Answer">
              <TextArea
                value={editing.answer}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                placeholder="Type the answer customers will read"
                rows={5}
              />
            </Field>
          </div>
        ) : null}
      </Dialog>
    </section>
  )
}

/* ---------------- (c) Download ---------------- */

function DownloadEditor({ user, bump, now }: { user: PublicUser; bump: () => void; now: Date }) {
  const dl = siteContent.download
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ version: '', fileName: '', fileSizeMb: '', notes: '' })

  const openEditor = () =>
    setDraft({
      version: dl.version,
      fileName: dl.fileName,
      fileSizeMb: String(dl.fileSizeMb),
      notes: dl.releaseNotes.join('\n'),
    })

  const save = () => {
    const version = draft.version.trim()
    const fileName = draft.fileName.trim()
    const size = Number(draft.fileSizeMb)
    if (!version || !fileName || !Number.isFinite(size) || size <= 0) return
    siteContent.download = {
      ...siteContent.download,
      version,
      fileName,
      fileSizeMb: Math.round(size),
      releaseNotes: draft.notes
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }
    pushAudit(user.name, 'site.download.update', `Updated the download section (kiosk app v${version}).`)
    setOpen(false)
    bump()
  }

  return (
    <section>
      <h3 className="flex items-center gap-2 font-display text-xl font-bold">
        <Download className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
        Download
      </h3>
      <StickerCard className="mt-3 flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="lime">v{dl.version}</Badge>
          <span className="font-mono text-xs font-bold">{dl.fileName}</span>
          <span className="text-xs font-bold text-black/55">{dl.fileSizeMb} MB</span>
        </div>
        <DetailList>
          <DetailItem k="Released" v={fmtDate(dl.releasedAt)} />
          <DetailItem
            k="Release notes"
            v={
              <ul className="ml-auto list-disc space-y-1 pl-4 text-left">
                {dl.releaseNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            }
          />
        </DetailList>
        <div>
          <NBButton
            tone="white"
            onClick={() => {
              openEditor()
              setOpen(true)
            }}
            icon={<Pencil className="size-5" strokeWidth={2.5} aria-hidden />}
            className="w-full sm:w-auto"
          >
            Edit download section
          </NBButton>
        </div>
      </StickerCard>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit download section"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <NBButton tone="white" onClick={() => setOpen(false)}>
              Cancel
            </NBButton>
            <NBButton onClick={save}>Save download</NBButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Version">
              <TextInput value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} placeholder="1.4.3" />
            </Field>
            <Field label="File size (MB)">
              <TextInput
                type="number"
                min={1}
                value={draft.fileSizeMb}
                onChange={(e) => setDraft({ ...draft, fileSizeMb: e.target.value })}
                placeholder="84"
              />
            </Field>
          </div>
          <Field label="File name">
            <TextInput
              value={draft.fileName}
              onChange={(e) => setDraft({ ...draft, fileName: e.target.value })}
              placeholder="SmartPrint-Setup-1.4.3.exe"
            />
          </Field>
          <Field label="Release notes" hint="One note per line — each line becomes a bullet on the public site.">
            <TextArea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={5}
              placeholder={'Faster QR pairing.\nClearer refund receipts.'}
            />
          </Field>
        </div>
      </Dialog>
    </section>
  )
}
