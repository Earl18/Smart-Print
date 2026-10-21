'use client'

/* Section 2 — Licenses: issue, assign and transfer. Status changes
   happen only through these actions, and every one is audited. */

import { useState } from 'react'
import { ArrowRightLeft, KeyRound, Link2, Plus } from 'lucide-react'
import { DataTable } from '@/components/site/DataTable'
import { Dialog } from '@/components/site/Dialog'
import { NBButton } from '@/components/site/NBButton'
import { StickerCard } from '@/components/site/primitives'
import { kiosks, licenses, pushAudit, users } from '@/lib/data/db'
import type { LicenseRecord, PublicUser } from '@/lib/data/types'
import {
  DetailItem,
  DetailList,
  Field,
  LicenseBadge,
  MonoChip,
  SectionHead,
  SelectInput,
  TextInput,
  fmtDate,
  untilLabel,
} from './shared'

type DialogState =
  | { type: 'issue' }
  | { type: 'detail'; license: LicenseRecord }
  | { type: 'assign'; license: LicenseRecord }
  | { type: 'transfer'; license: LicenseRecord }

/** Generates a key in the XXXX-XXXX-XXXX-XXXX format from random hex groups. */
function generateLicenseKey(): string {
  const hex = '0123456789ABCDEF'
  const group = () =>
    Array.from({ length: 4 }, () => hex[Math.floor(Math.random() * hex.length)]!).join('')
  return [group(), group(), group(), group()].join('-')
}

export function LicensesSection({ user, bump, now }: { user: PublicUser; bump: () => void; now: Date }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [issuedTo, setIssuedTo] = useState('')
  const [targetKioskId, setTargetKioskId] = useState('')

  const close = () => {
    setDialog(null)
    setIssuedTo('')
    setTargetKioskId('')
  }

  const issueLicense = () => {
    const name = issuedTo.trim()
    if (!name) return
    const key = generateLicenseKey()
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    licenses.unshift({
      key,
      issuedTo: name,
      kioskId: null,
      status: 'unassigned',
      issuedAt: new Date().toISOString(),
      expiresAt: expires.toISOString(),
      graceDays: 7,
    })
    pushAudit(user.name, 'license.issue', `Issued license ${key} to ${name}.`)
    close()
    bump()
  }

  const ownerOf = (kioskId: string) => users.find((u) => u.id === kiosks.find((k) => k.id === kioskId)?.ownerOperatorId)

  const assignLicense = (license: LicenseRecord, kioskId: string) => {
    const kiosk = kiosks.find((k) => k.id === kioskId)
    if (!kiosk) return
    // Free any other license currently bound to this kiosk.
    const previous = licenses.find((l) => l.kioskId === kiosk.id && l.key !== license.key)
    if (previous) {
      previous.kioskId = null
      previous.status = 'unassigned'
    }
    license.kioskId = kiosk.id
    license.status = 'active'
    kiosk.licenseKey = license.key
    pushAudit(
      user.name,
      'license.assign',
      `Assigned license ${license.key} to ${kiosk.name}${previous ? ` (freed ${previous.key})` : ''}.`,
    )
    close()
    bump()
  }

  const transferLicense = (license: LicenseRecord, kioskId: string) => {
    const from = kiosks.find((k) => k.id === license.kioskId)
    const to = kiosks.find((k) => k.id === kioskId)
    if (!to || to.id === license.kioskId) return
    if (from) from.licenseKey = ''
    license.kioskId = to.id
    license.status = 'active'
    to.licenseKey = license.key
    pushAudit(user.name, 'license.transfer', `Transferred license ${license.key} from ${from?.name ?? 'no kiosk'} to ${to.name}.`)
    close()
    bump()
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHead
        title="Licenses"
        sub="Every kiosk needs an active license. Issue a new key, then assign or transfer it to a kiosk."
        note={
          <NBButton className="mt-3 w-full sm:w-auto" icon={<Plus className="size-5" strokeWidth={2.5} aria-hidden />} onClick={() => setDialog({ type: 'issue' })}>
            Issue license
          </NBButton>
        }
      />

      <DataTable
        rows={licenses}
        rowKey={(l) => l.key}
        onRowClick={(l) => setDialog({ type: 'detail', license: l })}
        cardTitle={(l) => <span className="font-mono text-sm">{l.key}</span>}
        cardSub={(l) => <LicenseBadge status={l.status} />}
        columns={[
          {
            key: 'key',
            header: 'License key',
            render: (l) => <MonoChip>{l.key}</MonoChip>,
            text: (l) => l.key,
          },
          {
            key: 'issuedTo',
            header: 'Issued to',
            render: (l) => l.issuedTo,
            text: (l) => l.issuedTo,
          },
          {
            key: 'kiosk',
            header: 'Bound kiosk',
            render: (l) => kiosks.find((k) => k.id === l.kioskId)?.name ?? 'Unassigned',
            text: (l) => kiosks.find((k) => k.id === l.kioskId)?.name ?? 'Unassigned',
          },
          {
            key: 'status',
            header: 'Status',
            render: (l) => <LicenseBadge status={l.status} />,
            text: (l) => l.status.charAt(0).toUpperCase() + l.status.slice(1),
          },
          {
            key: 'expires',
            header: 'Expires',
            render: (l) => (
              <span>
                {fmtDate(l.expiresAt)} <span className="font-bold text-black/55">· {untilLabel(l.expiresAt, now)}</span>
              </span>
            ),
            text: (l) => `${fmtDate(l.expiresAt)} · ${untilLabel(l.expiresAt, now)}`,
          },
          {
            key: 'grace',
            header: 'Grace',
            render: (l) => `${l.graceDays} days`,
            text: (l) => `${l.graceDays} days`,
            hideOnMobile: true,
          },
        ]}
      />

      {/* Issue license */}
      <Dialog
        open={dialog?.type === 'issue'}
        onClose={close}
        title="Issue a new license"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <NBButton tone="white" onClick={close}>
              Cancel
            </NBButton>
            <NBButton onClick={issueLicense} disabled={!issuedTo.trim()} icon={<KeyRound className="size-5" strokeWidth={2.5} aria-hidden />}>
              Generate key
            </NBButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Issued to" hint="The operator or owner this license belongs to.">
            <TextInput
              value={issuedTo}
              onChange={(e) => setIssuedTo(e.target.value)}
              placeholder="Operator full name"
              autoComplete="off"
            />
          </Field>
          <p className="rounded-xl border-[3px] border-black bg-kpaper p-3 text-xs font-semibold text-black/60">
            A key in XXXX-XXXX-XXXX-XXXX format is generated for you. The license starts unassigned — bind it to a
            kiosk right after issuing.
          </p>
        </div>
      </Dialog>

      {/* License detail */}
      <Dialog open={dialog?.type === 'detail'} onClose={close} title="License details">
        {dialog?.type === 'detail' ? (
          <LicenseDetail license={dialog.license} now={now} onAssign={() => setDialog({ type: 'assign', license: dialog.license })} onTransfer={() => setDialog({ type: 'transfer', license: dialog.license })} />
        ) : null}
      </Dialog>

      {/* Assign / Transfer kiosk picker */}
      <Dialog
        open={dialog?.type === 'assign' || dialog?.type === 'transfer'}
        onClose={close}
        title={dialog?.type === 'assign' ? 'Assign license to a kiosk' : 'Transfer license to another kiosk'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <NBButton tone="white" onClick={close}>
              Cancel
            </NBButton>
            <NBButton
              disabled={!targetKioskId}
              icon={
                dialog?.type === 'assign' ? (
                  <Link2 className="size-5" strokeWidth={2.5} aria-hidden />
                ) : (
                  <ArrowRightLeft className="size-5" strokeWidth={2.5} aria-hidden />
                )
              }
              onClick={() => {
                if (dialog?.type === 'assign') assignLicense(dialog.license, targetKioskId)
                else if (dialog?.type === 'transfer') transferLicense(dialog.license, targetKioskId)
              }}
            >
              {dialog?.type === 'assign' ? 'Assign license' : 'Transfer license'}
            </NBButton>
          </div>
        }
      >
        {dialog && dialog.type !== 'issue' && dialog.type !== 'detail' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <MonoChip>{dialog.license.key}</MonoChip>
              <LicenseBadge status={dialog.license.status} />
            </div>
            <Field
              label={dialog.type === 'assign' ? 'Choose a kiosk' : 'Move to kiosk'}
              hint="Kiosks owned by suspended operators cannot receive licenses until the account is reactivated."
            >
              <SelectInput value={targetKioskId} onChange={(e) => setTargetKioskId(e.target.value)}>
                <option value="">Select a kiosk…</option>
                {kiosks.map((k) => {
                  const owner = ownerOf(k.id)
                  const suspendedOwner = owner?.status === 'suspended'
                  const isCurrent = k.id === dialog.license.kioskId
                  return (
                    <option key={k.id} value={k.id} disabled={suspendedOwner || (dialog.type === 'transfer' && isCurrent)}>
                      {k.name}
                      {suspendedOwner ? ' — owner suspended' : ''}
                      {dialog.type === 'transfer' && isCurrent ? ' — current kiosk' : ''}
                    </option>
                  )
                })}
              </SelectInput>
            </Field>
            {dialog.type === 'transfer' && dialog.license.kioskId ? (
              <p className="text-xs font-semibold text-black/55">
                Currently bound to {kiosks.find((k) => k.id === dialog.license.kioskId)?.name ?? '—'}. Transferring
                releases the old kiosk immediately.
              </p>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

function LicenseDetail({
  license,
  now,
  onAssign,
  onTransfer,
}: {
  license: LicenseRecord
  now: Date
  onAssign: () => void
  onTransfer: () => void
}) {
  const kiosk = kiosks.find((k) => k.id === license.kioskId)
  return (
    <div className="flex flex-col gap-4">
      <DetailList>
        <DetailItem k="License key" v={<MonoChip>{license.key}</MonoChip>} />
        <DetailItem k="Issued to" v={license.issuedTo} />
        <DetailItem k="Bound kiosk" v={kiosk?.name ?? 'Unassigned'} />
        <DetailItem k="Status" v={<LicenseBadge status={license.status} />} />
        <DetailItem k="Issued on" v={fmtDate(license.issuedAt)} />
        <DetailItem
          k="Expires"
          v={
            <span>
              {fmtDate(license.expiresAt)} · {untilLabel(license.expiresAt, now)}
            </span>
          }
        />
        <DetailItem k="Grace period" v={`${license.graceDays} days after expiry`} />
      </DetailList>
      <StickerCard tone="cream" className="p-3.5 text-xs font-semibold text-black/65">
        Status changes only through the actions below — assigning activates the license and binds it to the kiosk;
        transferring rebinds it and releases the previous kiosk.
      </StickerCard>
      <div className="flex flex-col gap-3 sm:flex-row">
        {license.kioskId === null ? (
          <NBButton onClick={onAssign} icon={<Link2 className="size-5" strokeWidth={2.5} aria-hidden />}>
            Assign to a kiosk
          </NBButton>
        ) : (
          <NBButton tone="blue" onClick={onTransfer} icon={<ArrowRightLeft className="size-5" strokeWidth={2.5} aria-hidden />}>
            Transfer to another kiosk
          </NBButton>
        )}
      </div>
    </div>
  )
}
