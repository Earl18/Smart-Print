/* ============================================================
   Smart Print — shared domain types for the data layer.
   Used by the public website, operator dashboard, admin console,
   auth APIs and the phone upload service.
   ============================================================ */

export type Role = 'admin' | 'operator'

export interface User extends PublicUser {
  password: string
  status: 'active' | 'suspended'
  createdAt: string
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: Role
  /** Kiosks this account may operate. Admins see the whole fleet. */
  kioskIds: string[]
}

export type KioskMode = 'online' | 'offline'
export type KioskStatus = 'online' | 'offline' | 'maintenance'
export type ComponentHealth = 'ok' | 'warn' | 'failed'

export interface KioskRecord {
  id: string
  name: string
  site: string
  ownerOperatorId: string | null
  mode: KioskMode
  status: KioskStatus
  paper: ComponentHealth
  printer: ComponentHealth
  cashAcceptor: ComponentHealth
  network: ComponentHealth
  licenseKey: string
  settingsVersion: number
  lastSyncAt: string
  installedAt: string
}

export type LicenseStatus = 'active' | 'expiring' | 'expired' | 'unassigned'

export interface LicenseRecord {
  key: string
  issuedTo: string
  kioskId: string | null
  status: LicenseStatus
  issuedAt: string
  expiresAt: string
  /** Days a kiosk may keep operating after expiry while it re-syncs. */
  graceDays: number
}

export type PaymentMethodTag = 'cash' | 'ewallet'
export type TransactionStatus = 'paid' | 'refunded'

export interface Transaction {
  id: string
  ref: string
  kioskId: string
  method: PaymentMethodTag
  amount: number
  status: TransactionStatus
  pages: number
  copies: number
  paper: 'A4' | 'Letter' | 'A3'
  color: 'bw' | 'color'
  /** ISO timestamp of when the transaction happened. */
  at: string
}

export interface HeldTransaction {
  id: string
  ref: string
  kioskId: string
  reason: string
  amountPaid: number
  heldAt: string
}

export type IncidentSeverity = 'critical' | 'major' | 'minor'
export type IncidentStatus = 'open' | 'acknowledged' | 'resolved'
export type IncidentComponent = 'printer' | 'paper' | 'cash' | 'wallet' | 'network' | 'software'

export interface IncidentTimelineEntry {
  at: string
  entry: string
}

export interface Incident {
  id: string
  kioskId: string
  severity: IncidentSeverity
  component: IncidentComponent
  jobId: string | null
  message: string
  openedAt: string
  status: IncidentStatus
  timeline: IncidentTimelineEntry[]
  /** Customer report (Document issue screen) that raised this incident. */
  linkedReportId: string | null
  /** True when the Diagnostics Lab forced a component into this state. */
  diagnostic: boolean
}

export interface CustomerReport {
  id: string
  kioskId: string
  jobId: string
  code: 'lines' | 'faded' | 'wrong_missing' | 'damaged' | 'other'
  note: string
  at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface KioskLocation {
  id: string
  name: string
  address: string
  hours: string
  kioskId: string
  online: boolean
  paper: ComponentHealth
}

export interface OperatorSettingsRecord {
  kioskId: string
  prices: Record<'A4' | 'Letter' | 'A3', Record<'bw' | 'color', number>>
  copyLimit: { min: number; max: number }
  allowedInputs: Array<'qr' | 'bluetooth' | 'usb'>
  paymentMethods: Array<'cash' | 'ewallet'>
  timers: { upload: { qr: number; bluetooth: number; usb: number }; cash: number; wallet: number }
  /** Minutes before a power interruption becomes a held transaction. */
  outageRecoveryWindowMin: number
  networkPolicy: 'online-required' | 'offline-fallback'
  operatorPin: string
  refundAutomation: 'auto-return' | 'staff-review'
}

export interface ConfigVersion {
  kioskId: string
  version: number
  publishedAt: string
  publishedBy: string
  note: string
}

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  detail: string
}

export interface SupportEvent {
  id: string
  kioskId: string
  kind: 'report' | 'incident' | 'refund'
  ref: string
  summary: string
  at: string
  status: IncidentStatus | 'processed'
}

export interface DownloadInfo {
  version: string
  releasedAt: string
  releaseNotes: string[]
  fileName: string
  fileSizeMb: number
}

export interface SiteContent {
  locations: KioskLocation[]
  faq: FaqItem[]
  download: DownloadInfo
}

/* ---------------- phone upload sessions ---------------- */

export interface UploadSessionPrefs {
  paper: 'A4' | 'Letter' | 'A3'
  color: 'bw' | 'color'
  copies: number
}

export interface UploadSession {
  sessionId: string
  kioskName: string
  prefs: UploadSessionPrefs
  /** 'waiting' while the kiosk shows the QR/receiving screen. */
  status: 'waiting' | 'received' | 'done'
  createdAt: number
  expiresAt: number
}

export interface UploadedFile {
  fileName: string
  sizeBytes: number
  fileType: string
  receivedAt: number
}

/* ---------------- auth ---------------- */

export interface LoginResponse {
  ok: boolean
  user?: PublicUser
  error?: string
}
