import type {
  DeviceStatus,
  DocMeta,
  FileSource,
  IntakeStatus,
  KioskConfig,
  PrintStatus,
  SetupProgress,
  UsbFile,
  WifiNetwork,
} from '@/kiosk/lib/types'
import type { Unsubscribe } from '@/kiosk/lib/emitter'

/* ============================================================
   PrinterService
   ============================================================ */

export interface PrinterJobSpec {
  id: string
  pages: number
  copies: number
}

export type PrinterStatusEvent = {
  status: PrintStatus
  pagesDone?: number
  pagesTotal?: number
  message?: string
}

export interface PrinterService {
  health(): Promise<{ ready: boolean; paper: 'ok' | 'low' | 'out'; message: string }>
  enqueue(spec: PrinterJobSpec): void
  resume(): void
  reset(): void
  on(event: 'status', cb: (payload: PrinterStatusEvent) => void): Unsubscribe
  /* Operator-only triggers (hidden panel) — same events a real driver emits. */
  injectJam(): void
  injectOutOfPaper(): void
  injectRecover(): void
}

/* ============================================================
   CashService
   ============================================================ */

export type CashInsertedEvent = { amount: number; total: number }
export type CashErrorEvent = { message: string }

export interface CashService {
  beginSession(due: number): void
  endSession(): void
  /** Self-check used by the setup wizard's device check. */
  check(): { ready: boolean; message: string }
  onInserted(cb: (payload: CashInsertedEvent) => void): Unsubscribe
  onError(cb: (payload: CashErrorEvent) => void): Unsubscribe
  /* Operator-only triggers (hidden panel). */
  accept(amount: number): void
  raiseError(message: string): void
}

/** Banknotes the acceptor takes. Coins are not accepted. */
export const CASH_DENOMINATIONS = [20, 50, 100, 200, 500, 1000] as const

/* ============================================================
   WalletService
   ============================================================ */

export type WalletStatusEvent = { status: 'awaiting' | 'confirmed' | 'failed' | 'expired' }

export interface WalletService {
  create(amount: number, orderRef: string): { reference: string; qrData: string }
  cancel(): void
  on(event: 'status', cb: (payload: WalletStatusEvent) => void): Unsubscribe
  /* Operator-only triggers (hidden panel). */
  confirm(): void
  fail(): void
  expire(): void
}

/* ============================================================
   FileIntakeService
   ============================================================ */

export type IntakeStatusEvent = {
  status: IntakeStatus
  message?: string
  fileName?: string
  usbFiles?: UsbFile[]
}
export type IntakeProgressEvent = { progress: number }
export type IntakeReceivedEvent = { doc: DocMeta }
export type IntakeFailedEvent = { reason: string; kind: 'timeout' | 'error' }

export interface FileIntakeService {
  start(source: FileSource): void
  cancel(): void
  pickUsbFile(name: string): void
  on(event: 'status', cb: (payload: IntakeStatusEvent) => void): Unsubscribe
  on(event: 'progress', cb: (payload: IntakeProgressEvent) => void): Unsubscribe
  on(event: 'received', cb: (payload: IntakeReceivedEvent) => void): Unsubscribe
  on(event: 'failed', cb: (payload: IntakeFailedEvent) => void): Unsubscribe
  /* Operator-only triggers (hidden panel). */
  deliverNow(partial?: Partial<DocMeta>): void
  deliverCorrupt(): void
  triggerTimeout(): void
}

/* ============================================================
   StorageService — session persistence & file bookkeeping
   ============================================================ */

export interface StoredSession {
  powerLostAt: number | null
  session: import('@/kiosk/lib/types').SavedSession | null
}

export interface StorageService {
  save(state: import('@/kiosk/lib/types').KioskState): void
  load(): StoredSession
  clear(): void
  deleteFile(): void
  markPowerLoss(): void
}

/* ============================================================
   SystemService — network / license / device checks
   ============================================================ */

export interface SystemFlags {
  storageFreeGb: number
  storageTotalGb: number
  bluetooth: boolean
  usb: boolean
}

export interface SystemService {
  check(): { online: boolean; licenseOk: boolean }
  /** Local hardware probes for the setup wizard's device check. */
  flags(): SystemFlags
  toggleOffline(): void
  toggleLicense(): void
  activateLicense(): void
}

/* ============================================================
   KioskConfigService — persisted kiosk configuration
   ============================================================ */

export interface KioskConfigService {
  /** The stored configuration, or null on a factory-fresh kiosk. */
  load(): KioskConfig | null
  save(config: KioskConfig): void
  /** Clears license + configuration. Held customer sessions are kept. */
  resetKiosk(kioskId?: string): void
  loadSetupProgress(): SetupProgress | null
  saveSetupProgress(progress: SetupProgress): void
  clearSetupProgress(): void
  /** Verifies the maintenance PIN. Failed attempts lock the keypad for a minute. */
  verifyOperatorPin(pin: string): { ok: boolean; lockedFor: number }
  /** Seconds remaining on an active PIN lockout (0 when unlocked). */
  pinLockRemaining(): number
  setWebsiteUrl(url: string): void
}

/* ============================================================
   NetworkSetupService — setup-time network & license activation
   ============================================================ */

export type LicenseStatus = 'valid' | 'invalid' | 'expired' | 'in_use'

export interface LicenseValidation {
  status: LicenseStatus
  operatorName?: string
  kioskName?: string
}

export type ConnectStage = 'wifi' | 'internet' | 'service'
export type ConnectStageState = 'active' | 'ok' | 'failed'

export interface PublishedSettings {
  version: number
  settings: import('@/kiosk/lib/types').OperatorSettings
  source: 'remote' | 'bundled'
}

export interface NetworkSetupService {
  scanWifi(): Promise<WifiNetwork[]>
  connectWifi(
    ssid: string,
    password: string,
    onStage: (stage: ConnectStage, state: ConnectStageState, message?: string) => void,
  ): Promise<{ ok: boolean; message: string | null }>
  validateLicense(key: string): Promise<LicenseValidation>
  fetchPublishedSettings(mode: 'online' | 'offline'): Promise<PublishedSettings>
}

/* ============================================================
   DeviceCheckService — setup wizard hardware checks
   ============================================================ */

export interface DeviceCheckService {
  runChecks(): Promise<DeviceStatus[]>
}
