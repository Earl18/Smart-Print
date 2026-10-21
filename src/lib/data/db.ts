/* ============================================================
   Smart Print — shared typed data layer.
   One set of records with consistent values used across the
   public website, operator dashboard, admin console and auth.
   Runs identically on the server (auth APIs) and in the browser
   (dashboards import it directly).
   ============================================================ */

import { RATES } from '@/kiosk/lib/pricing'
import type {
  AuditEntry,
  ConfigVersion,
  CustomerReport,
  FaqItem,
  HeldTransaction,
  Incident,
  KioskLocation,
  KioskRecord,
  LicenseRecord,
  OperatorSettingsRecord,
  PublicUser,
  SiteContent,
  SupportEvent,
  Transaction,
  UploadSession,
  UploadedFile,
  User,
} from './types'

/* ---------------- date helpers ---------------- */

function dayOffsetIso(days: number, hours: number, minutes: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

function minutesAgoIso(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}

/* ============================================================
   Seed records
   ============================================================ */

export const users: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Ana Reyes',
    email: 'admin@smartprint.example',
    password: 'print2025',
    role: 'admin',
    kioskIds: ['kios-quiapo-01', 'kios-cebu-01', 'kios-davao-01', 'kios-makati-01'],
    status: 'active',
    createdAt: '2024-02-11T08:00:00.000Z',
  },
  {
    id: 'usr-op-1',
    name: 'Marco Dela Cruz',
    email: 'operator@smartprint.example',
    password: 'print2025',
    role: 'operator',
    kioskIds: ['kios-quiapo-01', 'kios-cebu-01', 'kios-davao-01'],
    status: 'active',
    createdAt: '2024-06-03T09:30:00.000Z',
  },
  {
    id: 'usr-op-2',
    name: 'Lia Santos',
    email: 'lia.santos@smartprint.example',
    password: 'print2025',
    role: 'operator',
    kioskIds: ['kios-makati-01'],
    status: 'suspended',
    createdAt: '2024-09-18T13:15:00.000Z',
  },
]

export const kiosks: KioskRecord[] = [
  {
    id: 'kios-quiapo-01',
    name: 'SP-Quiapo-01',
    site: 'Quiapo Hub · FF Suarez St, Manila',
    ownerOperatorId: 'usr-op-1',
    mode: 'online',
    status: 'online',
    paper: 'ok',
    printer: 'ok',
    cashAcceptor: 'ok',
    network: 'ok',
    licenseKey: '4F2A-9C1D-77B3-E5A0',
    settingsVersion: 7,
    lastSyncAt: minutesAgoIso(4),
    installedAt: '2024-07-02T10:00:00.000Z',
  },
  {
    id: 'kios-cebu-01',
    name: 'SP-Cebu-01',
    site: 'Cebu IT Park · Gate 3, Lahug',
    ownerOperatorId: 'usr-op-1',
    mode: 'online',
    status: 'online',
    paper: 'warn',
    printer: 'ok',
    cashAcceptor: 'ok',
    network: 'ok',
    licenseKey: '8B31-D2F6-4A9C-E07B',
    settingsVersion: 7,
    lastSyncAt: minutesAgoIso(11),
    installedAt: '2024-08-19T09:00:00.000Z',
  },
  {
    id: 'kios-davao-01',
    name: 'SP-Davao-01',
    site: 'Davao SM Annex · Matina',
    ownerOperatorId: 'usr-op-1',
    mode: 'offline',
    status: 'online',
    paper: 'ok',
    printer: 'ok',
    cashAcceptor: 'warn',
    network: 'ok',
    licenseKey: 'C55D-8E21-9F04-B6A3',
    settingsVersion: 5,
    lastSyncAt: minutesAgoIso(52),
    installedAt: '2024-11-05T11:30:00.000Z',
  },
  {
    id: 'kios-makati-01',
    name: 'SP-Makati-01',
    site: 'Makati · Dela Rosa Elevated Station',
    ownerOperatorId: 'usr-op-2',
    mode: 'online',
    status: 'maintenance',
    paper: 'ok',
    printer: 'warn',
    cashAcceptor: 'ok',
    network: 'failed',
    licenseKey: '2E7A-41C9-D8B3-50F6',
    settingsVersion: 6,
    lastSyncAt: minutesAgoIso(180),
    installedAt: '2025-01-22T14:00:00.000Z',
  },
]

export const licenses: LicenseRecord[] = [
  {
    key: '4F2A-9C1D-77B3-E5A0',
    issuedTo: 'Marco Dela Cruz',
    kioskId: 'kios-quiapo-01',
    status: 'active',
    issuedAt: '2024-07-02T10:00:00.000Z',
    expiresAt: dayOffsetIso(240, 12, 0),
    graceDays: 7,
  },
  {
    key: '8B31-D2F6-4A9C-E07B',
    issuedTo: 'Marco Dela Cruz',
    kioskId: 'kios-cebu-01',
    status: 'active',
    issuedAt: '2024-08-19T09:00:00.000Z',
    expiresAt: dayOffsetIso(300, 12, 0),
    graceDays: 7,
  },
  {
    key: 'C55D-8E21-9F04-B6A3',
    issuedTo: 'Marco Dela Cruz',
    kioskId: 'kios-davao-01',
    status: 'active',
    issuedAt: '2024-11-05T11:30:00.000Z',
    expiresAt: dayOffsetIso(365, 12, 0),
    graceDays: 7,
  },
  {
    key: '2E7A-41C9-D8B3-50F6',
    issuedTo: 'Lia Santos',
    kioskId: 'kios-makati-01',
    status: 'expiring',
    issuedAt: '2025-01-22T14:00:00.000Z',
    expiresAt: dayOffsetIso(12, 12, 0),
    graceDays: 7,
  },
  {
    key: '9A0F-73DB-2C46-18E9',
    issuedTo: 'Marco Dela Cruz',
    kioskId: null,
    status: 'unassigned',
    issuedAt: '2025-03-01T09:00:00.000Z',
    expiresAt: dayOffsetIso(400, 12, 0),
    graceDays: 7,
  },
]

/* Transactions cover today and yesterday so Sales Monitoring has a
   real date range to filter; totals are always computed from rows. */
export const transactions: Transaction[] = [
  t('tx-01', 'CSH-894742', 'kios-quiapo-01', 'cash', 30, 'paid', 3, 2, 'A4', 'bw', 0, 8, 12),
  t('tx-02', 'EWL-331208', 'kios-quiapo-01', 'ewallet', 45, 'paid', 3, 3, 'A4', 'color', 0, 9, 5),
  t('tx-03', 'CSH-894758', 'kios-quiapo-01', 'cash', 15, 'paid', 3, 1, 'A4', 'bw', 0, 9, 48),
  t('tx-04', 'EWL-331277', 'kios-cebu-01', 'ewallet', 80, 'paid', 4, 2, 'A3', 'color', 0, 10, 22),
  t('tx-05', 'CSH-894790', 'kios-cebu-01', 'cash', 25, 'paid', 5, 1, 'A4', 'bw', 0, 11, 3),
  t('tx-06', 'CSH-894811', 'kios-davao-01', 'cash', 20, 'paid', 2, 1, 'A3', 'bw', 0, 11, 41),
  t('tx-07', 'EWL-331305', 'kios-quiapo-01', 'ewallet', 30, 'refunded', 3, 2, 'A4', 'bw', 0, 12, 18),
  t('tx-08', 'CSH-894855', 'kios-quiapo-01', 'cash', 60, 'paid', 6, 2, 'A4', 'bw', 0, 13, 26),
  t('tx-09', 'EWL-331390', 'kios-cebu-01', 'ewallet', 15, 'paid', 3, 1, 'A4', 'color', 0, 14, 2),
  t('tx-10', 'CSH-894902', 'kios-davao-01', 'cash', 50, 'paid', 5, 1, 'A3', 'bw', 0, 14, 57),
  t('tx-11', 'EWL-331455', 'kios-quiapo-01', 'ewallet', 20, 'paid', 2, 2, 'A4', 'color', 0, 15, 34),
  t('tx-12', 'CSH-894977', 'kios-quiapo-01', 'cash', 10, 'paid', 2, 1, 'A4', 'bw', 0, 16, 9),
  t('tx-13', 'CSH-895014', 'kios-davao-01', 'cash', 35, 'refunded', 7, 1, 'A4', 'bw', 0, 16, 47),
  t('tx-14', 'EWL-331509', 'kios-cebu-01', 'ewallet', 40, 'paid', 4, 1, 'A4', 'color', 0, 17, 21),
  // Yesterday
  t('tx-15', 'CSH-893551', 'kios-quiapo-01', 'cash', 55, 'paid', 5, 1, 'A4', 'color', -1, 9, 15),
  t('tx-16', 'EWL-330104', 'kios-quiapo-01', 'ewallet', 30, 'paid', 3, 2, 'A4', 'bw', -1, 10, 40),
  t('tx-17', 'CSH-893610', 'kios-cebu-01', 'cash', 20, 'paid', 2, 2, 'A4', 'bw', -1, 11, 55),
  t('tx-18', 'CSH-893702', 'kios-davao-01', 'cash', 40, 'paid', 4, 1, 'A3', 'bw', -1, 13, 8),
  t('tx-19', 'EWL-330290', 'kios-quiapo-01', 'ewallet', 90, 'paid', 3, 3, 'A3', 'color', -1, 15, 27),
  t('tx-20', 'CSH-893795', 'kios-quiapo-01', 'cash', 15, 'paid', 3, 1, 'A4', 'bw', -1, 17, 44),
]

function t(
  id: string,
  ref: string,
  kioskId: string,
  method: Transaction['method'],
  amount: number,
  status: Transaction['status'],
  pages: number,
  copies: number,
  paper: Transaction['paper'],
  color: Transaction['color'],
  dayOffset: number,
  hours: number,
  minutes: number,
): Transaction {
  return { id, ref, kioskId, method, amount, status, pages, copies, paper, color, at: dayOffsetIso(dayOffset, hours, minutes) }
}

export const heldTransactions: HeldTransaction[] = [
  {
    id: 'hld-01',
    ref: 'SP-7QK2',
    kioskId: 'kios-cebu-01',
    reason: 'Power interrupted while printing — job kept for retry',
    amountPaid: 30,
    heldAt: minutesAgoIso(95),
  },
  {
    id: 'hld-02',
    ref: 'SP-M4X8',
    kioskId: 'kios-makati-01',
    reason: 'Paper jam after payment — waiting for operator retry',
    amountPaid: 45,
    heldAt: minutesAgoIso(260),
  },
]

export const incidents: Incident[] = [
  {
    id: 'inc-01',
    kioskId: 'kios-makati-01',
    severity: 'critical',
    component: 'network',
    jobId: null,
    message: 'Kiosk lost internet and entered maintenance — e-wallet and QR upload disabled.',
    openedAt: minutesAgoIso(185),
    status: 'open',
    timeline: [
      { at: minutesAgoIso(185), entry: 'Network check failed three times in a row.' },
      { at: minutesAgoIso(180), entry: 'Kiosk switched to maintenance screen.' },
    ],
    linkedReportId: null,
    diagnostic: false,
  },
  {
    id: 'inc-02',
    kioskId: 'kios-cebu-01',
    severity: 'major',
    component: 'printer',
    jobId: 'JOB-4471',
    message: 'Paper jam detected mid-job. Paid job kept as held transaction for retry.',
    openedAt: minutesAgoIso(100),
    status: 'acknowledged',
    timeline: [
      { at: minutesAgoIso(100), entry: 'Jam sensor triggered on page 2 of 6.' },
      { at: minutesAgoIso(96), entry: 'Job SP-7QK2 held with full payment.' },
      { at: minutesAgoIso(90), entry: 'Marco acknowledged the incident from the dashboard.' },
    ],
    linkedReportId: 'rep-01',
    diagnostic: false,
  },
  {
    id: 'inc-03',
    kioskId: 'kios-davao-01',
    severity: 'minor',
    component: 'cash',
    jobId: null,
    message: 'Cash acceptor reported a slow bill return. Watched, no customer impact.',
    openedAt: minutesAgoIso(320),
    status: 'resolved',
    timeline: [
      { at: minutesAgoIso(320), entry: 'Acceptor self-test reported slow eject.' },
      { at: minutesAgoIso(240), entry: 'Recovery cycle passed — resolved.' },
    ],
    linkedReportId: null,
    diagnostic: false,
  },
  {
    id: 'inc-04',
    kioskId: 'kios-quiapo-01',
    severity: 'minor',
    component: 'printer',
    jobId: 'JOB-4489',
    message: 'Customer reported faded print on page 3. Toner checked, sample printed clean.',
    openedAt: minutesAgoIso(55),
    status: 'open',
    timeline: [{ at: minutesAgoIso(55), entry: 'Customer report received from the kiosk screen.' }],
    linkedReportId: 'rep-02',
    diagnostic: false,
  },
]

export const customerReports: CustomerReport[] = [
  {
    id: 'rep-01',
    kioskId: 'kios-cebu-01',
    jobId: 'JOB-4471',
    code: 'wrong_missing',
    note: 'Page 2 was blank after the jam retry.',
    at: minutesAgoIso(98),
  },
  {
    id: 'rep-02',
    kioskId: 'kios-quiapo-01',
    jobId: 'JOB-4489',
    code: 'faded',
    note: 'Last page came out very light.',
    at: minutesAgoIso(56),
  },
]

export const supportEvents: SupportEvent[] = [
  { id: 'sup-01', kioskId: 'kios-cebu-01', kind: 'report', ref: 'rep-01', summary: 'Wrong or missing pages · JOB-4471', at: minutesAgoIso(98), status: 'acknowledged' },
  { id: 'sup-02', kioskId: 'kios-quiapo-01', kind: 'report', ref: 'rep-02', summary: 'Faded print · JOB-4489', at: minutesAgoIso(56), status: 'open' },
  { id: 'sup-03', kioskId: 'kios-quiapo-01', kind: 'refund', ref: 'EWL-331305', summary: 'E-wallet refund ₱30 · printing failed', at: minutesAgoIso(280), status: 'processed' },
  { id: 'sup-04', kioskId: 'kios-davao-01', kind: 'refund', ref: 'CSH-895014', summary: 'Cash refund ₱35 at kiosk · jammed job', at: minutesAgoIso(40), status: 'processed' },
  { id: 'sup-05', kioskId: 'kios-makati-01', kind: 'incident', ref: 'inc-01', summary: 'Network down · kiosk in maintenance', at: minutesAgoIso(185), status: 'open' },
]

export const faq: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How do I send my file to the kiosk?',
    answer:
      'Pick QR code on the kiosk, scan it with your phone camera, and upload from the page that opens. You can also use Bluetooth from a laptop or plug in a USB drive.',
  },
  {
    id: 'faq-2',
    question: 'What file types can I print?',
    answer: 'PDF, Word (DOCX), JPG and PNG files are supported. The maximum file size is 20 MB.',
  },
  {
    id: 'faq-3',
    question: 'How much does printing cost?',
    answer:
      'A4 or Letter costs ₱5 per page in black & white and ₱10 in color. A3 costs ₱10 per page in black & white and ₱15 in color. For example, 3 black & white pages × 2 copies = ₱15 per copy × 2 copies = ₱30.',
  },
  {
    id: 'faq-4',
    question: 'How do I pay?',
    answer:
      'Insert cash into the acceptor — exact amounts are appreciated and overpayments are returned — or pay with GCash, Maya and other e-wallets by scanning the payment code.',
  },
  {
    id: 'faq-5',
    question: 'What happens if printing fails after I paid?',
    answer:
      'Your job is kept at the kiosk as a held transaction. You can retry it free of charge, or ask our staff for a refund — you never pay twice for the same pages.',
  },
  {
    id: 'faq-6',
    question: 'Do you keep a copy of my file?',
    answer:
      'No. Your file goes directly to the kiosk you are standing at and is deleted from it right after printing. Nothing is stored in the cloud.',
  },
  {
    id: 'faq-7',
    question: 'Can I print if the kiosk has no internet?',
    answer:
      'Yes. Kiosks in offline mode still accept Bluetooth and USB uploads and cash payments. QR upload and e-wallet need an internet connection.',
  },
  {
    id: 'faq-8',
    question: 'How many copies can I print in one job?',
    answer: 'Between 1 and 10 copies of the same document per job. Need more? Start a second job.',
  },
]

export const locations: KioskLocation[] = [
  { id: 'loc-1', name: 'Quiapo Hub', address: 'FF Suarez St, Quiapo, Manila', hours: 'Open 8 AM – 9 PM', kioskId: 'kios-quiapo-01', online: true, paper: 'ok' },
  { id: 'loc-2', name: 'Cebu IT Park', address: 'Gate 3, Lahug, Cebu City', hours: 'Open 24/7', kioskId: 'kios-cebu-01', online: true, paper: 'warn' },
  { id: 'loc-3', name: 'Davao SM Annex', address: 'Matina, Davao City', hours: 'Open 10 AM – 8 PM', kioskId: 'kios-davao-01', online: true, paper: 'ok' },
  { id: 'loc-4', name: 'Makati Dela Rosa', address: 'Dela Rosa Elevated Station, Makati', hours: 'Open 6 AM – 10 PM', kioskId: 'kios-makati-01', online: false, paper: 'ok' },
  { id: 'loc-5', name: 'QC Circle Wing', address: 'Quezon Memorial Circle, Quezon City', hours: 'Open 9 AM – 8 PM', kioskId: 'kios-quiapo-01', online: true, paper: 'ok' },
  { id: 'loc-6', name: 'Iloilo Esplanade', address: 'Esplanade 2, Iloilo City', hours: 'Open 10 AM – 9 PM', kioskId: 'kios-cebu-01', online: true, paper: 'ok' },
]

export const operatorSettings: OperatorSettingsRecord[] = [
  {
    kioskId: 'kios-quiapo-01',
    prices: RATES,
    copyLimit: { min: 1, max: 10 },
    allowedInputs: ['qr', 'bluetooth', 'usb'],
    paymentMethods: ['cash', 'ewallet'],
    timers: { upload: { qr: 120, bluetooth: 180, usb: 120 }, cash: 120, wallet: 300 },
    outageRecoveryWindowMin: 10,
    networkPolicy: 'online-required',
    operatorPin: '357191',
    refundAutomation: 'auto-return',
  },
  {
    kioskId: 'kios-cebu-01',
    prices: RATES,
    copyLimit: { min: 1, max: 10 },
    allowedInputs: ['qr', 'bluetooth', 'usb'],
    paymentMethods: ['cash', 'ewallet'],
    timers: { upload: { qr: 120, bluetooth: 180, usb: 120 }, cash: 120, wallet: 300 },
    outageRecoveryWindowMin: 10,
    networkPolicy: 'online-required',
    operatorPin: '482630',
    refundAutomation: 'auto-return',
  },
  {
    kioskId: 'kios-davao-01',
    prices: RATES,
    copyLimit: { min: 1, max: 10 },
    allowedInputs: ['bluetooth', 'usb'],
    paymentMethods: ['cash'],
    timers: { upload: { qr: 120, bluetooth: 180, usb: 120 }, cash: 120, wallet: 300 },
    outageRecoveryWindowMin: 10,
    networkPolicy: 'offline-fallback',
    operatorPin: '615048',
    refundAutomation: 'staff-review',
  },
  {
    kioskId: 'kios-makati-01',
    prices: RATES,
    copyLimit: { min: 1, max: 10 },
    allowedInputs: ['qr', 'bluetooth', 'usb'],
    paymentMethods: ['cash', 'ewallet'],
    timers: { upload: { qr: 120, bluetooth: 180, usb: 120 }, cash: 120, wallet: 300 },
    outageRecoveryWindowMin: 10,
    networkPolicy: 'online-required',
    operatorPin: '203954',
    refundAutomation: 'auto-return',
  },
]

export const configVersions: ConfigVersion[] = [
  { kioskId: 'kios-quiapo-01', version: 7, publishedAt: minutesAgoIso(60 * 26), publishedBy: 'Marco Dela Cruz', note: 'Raised wallet timer to 5 minutes.' },
  { kioskId: 'kios-quiapo-01', version: 6, publishedAt: dayOffsetIso(-6, 10, 0), publishedBy: 'Marco Dela Cruz', note: 'Enabled colored A3 pricing from the rate card.' },
  { kioskId: 'kios-cebu-01', version: 7, publishedAt: minutesAgoIso(60 * 30), publishedBy: 'Marco Dela Cruz', note: 'Sync with latest rate card.' },
  { kioskId: 'kios-davao-01', version: 5, publishedAt: dayOffsetIso(-12, 9, 0), publishedBy: 'Marco Dela Cruz', note: 'Switched to offline mode — cash only.' },
  { kioskId: 'kios-makati-01', version: 6, publishedAt: dayOffsetIso(-3, 16, 0), publishedBy: 'Lia Santos', note: 'Initial configuration tune-up.' },
]

export const auditLog: AuditEntry[] = [
  { id: 'aud-01', at: minutesAgoIso(60 * 26), actor: 'Marco Dela Cruz', action: 'config.publish', detail: 'Published settings v7 for SP-Quiapo-01.' },
  { id: 'aud-02', at: minutesAgoIso(90), actor: 'Marco Dela Cruz', action: 'incident.acknowledge', detail: 'Acknowledged printer jam on SP-Cebu-01 (JOB-4471).' },
  { id: 'aud-03', at: minutesAgoIso(280), actor: 'System', action: 'refund.processed', detail: 'E-wallet refund ₱30 for EWL-331305.' },
  { id: 'aud-04', at: minutesAgoIso(400), actor: 'Ana Reyes', action: 'license.issue', detail: 'Issued license 9A0F-73DB-2C46-18E9 to Marco Dela Cruz.' },
  { id: 'aud-05', at: dayOffsetIso(-2, 11, 0), actor: 'Ana Reyes', action: 'operator.suspend', detail: 'Suspended operator account Lia Santos pending review.' },
  { id: 'aud-06', at: dayOffsetIso(-3, 16, 0), actor: 'Lia Santos', action: 'config.publish', detail: 'Published settings v6 for SP-Makati-01.' },
]

export const siteContent: SiteContent = {
  locations,
  faq,
  download: {
    version: '1.4.2',
    releasedAt: dayOffsetIso(-9, 15, 0),
    releaseNotes: [
      'Faster QR pairing between phone and kiosk.',
      'Clearer cash refund receipts with excess breakdown.',
      'Kiosk setup wizard now resumes exactly where it stopped after a power cut.',
    ],
    fileName: 'SmartPrint-Setup-1.4.2.exe',
    fileSizeMb: 84,
  },
}

/* ---------------- diagnostics (admin lab) ----------------
   Client-side overrides: 'failed' or 'offline' per component,
   mirrored in the kiosk status the operator dashboard shows. */

export type DiagnosticComponent = 'printer' | 'cashAcceptor' | 'network'
export type DiagnosticState = 'normal' | 'failed' | 'offline'

const diagnostics = new Map<string, Partial<Record<DiagnosticComponent, DiagnosticState>>>()

export function getDiagnostics(kioskId: string): Partial<Record<DiagnosticComponent, DiagnosticState>> {
  return diagnostics.get(kioskId) ?? {}
}

export function setDiagnostic(kioskId: string, component: DiagnosticComponent, state: DiagnosticState): void {
  const current = { ...getDiagnostics(kioskId) }
  if (state === 'normal') delete current[component]
  else current[component] = state
  if (Object.keys(current).length === 0) diagnostics.delete(kioskId)
  else diagnostics.set(kioskId, current)
}

export function resetDiagnostics(kioskId?: string): void {
  if (kioskId) diagnostics.delete(kioskId)
  else diagnostics.clear()
}

/* ---------------- mutation helpers (log to audit trail) ---------------- */

export function pushAudit(actor: string, action: string, detail: string): void {
  auditLog.unshift({
    id: `aud-${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    actor,
    action,
    detail,
  })
}

export function pushIncident(incident: Omit<Incident, 'id' | 'timeline'> & { timeline?: Incident['timeline'] }): Incident {
  const full: Incident = {
    ...incident,
    id: `inc-${Date.now().toString(36)}`,
    timeline: incident.timeline ?? [{ at: new Date().toISOString(), entry: incident.message }],
  }
  incidents.unshift(full)
  return full
}

/* ============================================================
   Selectors
   ============================================================ */

export function toPublicUser(u: User): PublicUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role, kioskIds: u.kioskIds }
}

export function findUserByCredentials(email: string, password: string): User | null {
  const needle = email.trim().toLowerCase()
  return (
    users.find(
      (u) => u.email.toLowerCase() === needle && u.password === password && u.status === 'active',
    ) ?? null
  )
}

export function findUserById(id: string): User | null {
  return users.find((u) => u.id === id) ?? null
}

export function kiosksForUser(user: PublicUser | null): KioskRecord[] {
  if (!user) return []
  if (user.role === 'admin') return kiosks
  return kiosks.filter((k) => user.kioskIds.includes(k.id))
}

export interface SalesSummary {
  cash: number
  ewallet: number
  refunds: number
  total: number
  count: number
}

/** Totals are always computed from the filtered rows, so they match. */
export function summarizeSales(rows: Transaction[]): SalesSummary {
  let cash = 0
  let ewallet = 0
  let refunds = 0
  for (const row of rows) {
    if (row.status === 'refunded') {
      refunds += row.amount
      continue
    }
    if (row.method === 'cash') cash += row.amount
    else ewallet += row.amount
  }
  return { cash, ewallet, refunds, total: cash + ewallet, count: rows.length }
}

export function transactionsInRange(fromIso: string, toIso: string, kioskIds?: string[]): Transaction[] {
  const from = new Date(fromIso).getTime()
  const to = new Date(toIso).getTime()
  return transactions
    .filter((tx) => {
      const at = new Date(tx.at).getTime()
      return at >= from && at <= to && (!kioskIds || kioskIds.includes(tx.kioskId))
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

export function sameDayIso(a: string, b: Date): boolean {
  const da = new Date(a)
  return da.getFullYear() === b.getFullYear() && da.getMonth() === b.getMonth() && da.getDate() === b.getDate()
}

export function todayTransactions(kioskIds?: string[]): Transaction[] {
  const now = new Date()
  return transactions.filter((tx) => sameDayIso(tx.at, now) && (!kioskIds || kioskIds.includes(tx.kioskId)))
}

/* ============================================================
   Phone upload sessions (in-memory, TTL 30 minutes).
   The kiosk registers a session when the QR screen opens; the
   phone page fetches it and posts the file; the kiosk polls for it.
   ============================================================ */

const SESSION_TTL_MS = 30 * 60 * 1000
const uploadSessions = new Map<string, UploadSession>()
const uploadFiles = new Map<string, UploadedFile>()

export const UPLOAD_LIMITS = {
  maxBytes: 20 * 1024 * 1024,
  extensions: ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'],
}

export function registerUploadSession(input: { sessionId: string; kioskName: string; prefs: UploadSession['prefs'] }): UploadSession {
  const existing = uploadSessions.get(input.sessionId)
  const session: UploadSession = {
    sessionId: input.sessionId,
    kioskName: input.kioskName,
    prefs: input.prefs,
    status: 'waiting',
    createdAt: existing?.createdAt ?? Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  uploadSessions.set(input.sessionId, session)
  return session
}

export function getUploadSession(sessionId: string): UploadSession | null {
  const s = uploadSessions.get(sessionId)
  if (!s) return null
  if (Date.now() > s.expiresAt) {
    uploadSessions.delete(sessionId)
    uploadFiles.delete(sessionId)
    return null
  }
  return s
}

export function markUploadReceived(sessionId: string): void {
  const s = uploadSessions.get(sessionId)
  if (s) s.status = 'received'
}

export function markUploadDone(sessionId: string): void {
  const s = uploadSessions.get(sessionId)
  if (s) s.status = 'done'
  uploadFiles.delete(sessionId)
}

export function setUploadedFile(sessionId: string, file: UploadedFile): void {
  uploadFiles.set(sessionId, file)
  markUploadReceived(sessionId)
}

export function getUploadedFile(sessionId: string): UploadedFile | null {
  return uploadFiles.get(sessionId) ?? null
}

export function clearUploadedFile(sessionId: string): void {
  uploadFiles.delete(sessionId)
  const s = uploadSessions.get(sessionId)
  if (s && s.status === 'received') s.status = 'waiting'
}
