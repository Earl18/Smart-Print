import type { DocMeta, FileSource, IntakeStatus, PrintStatus, UsbFile } from '@/kiosk/lib/types'
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

export interface SystemService {
  check(): { online: boolean; licenseOk: boolean }
  toggleOffline(): void
  toggleLicense(): void
}
