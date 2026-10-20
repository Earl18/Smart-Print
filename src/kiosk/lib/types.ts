/* ============================================================
   Smart Print — domain types & session state machine types
   ============================================================ */

export type PaperSize = 'A4' | 'Letter' | 'A3'
export type ColorMode = 'bw' | 'color'
export type FileSource = 'qr' | 'bluetooth' | 'usb'
export type DocKind = 'pdf' | 'image' | 'document' | 'unknown'

export interface DocMeta {
  name: string
  ext: string
  sizeBytes: number
  kind: DocKind
  pages: number
  images: number
  /** Present when the kiosk could not read the file. */
  unreadableReason?: string
}

export interface UsbFile {
  name: string
  ext: string
  sizeBytes: number
  kind: DocKind
}

export interface PriceBreakdown {
  pages: number
  perPage: number
  perCopy: number
  copies: number
  subtotal: number
  total: number
}

export type PaymentMethod = 'cash' | 'ewallet'
export type PaymentStatus = 'awaiting' | 'confirmed' | 'expired' | 'failed'
export type PrintStatus = 'idle' | 'queued' | 'printing' | 'paper_jam' | 'out_of_paper' | 'completed'
export type IntakeStatus = 'idle' | 'waiting' | 'reading' | 'ready' | 'receiving' | 'error' | 'timeout'
export type ReportCode = 'lines' | 'faded' | 'wrong_missing' | 'damaged' | 'other'

export interface PrinterHealth {
  ready: boolean
  paper: 'ok' | 'low' | 'out'
  message: string
}

export type Phase =
  | 'BOOT'
  | 'SETUP_REQUIRED'
  | 'NOT_READY'
  | 'WELCOME'
  | 'RECOVERY_PROMPT'
  | 'PREFERENCES'
  | 'SOURCE_SELECT'
  | 'RECEIVING'
  | 'SCAN'
  | 'REVIEW'
  | 'PAYMENT_METHOD'
  | 'PAY_CASH'
  | 'PAY_EWALLET'
  | 'PRINTING'
  | 'SUCCESS'
  | 'REPORT_PROBLEM'
  | 'OUTAGE_HOLD'

/** The slice of the session that is persisted for power recovery. */
export interface SavedSession {
  phase: Phase
  prefs: { paper: PaperSize; color: ColorMode; copies: number }
  source: FileSource | null
  doc: DocMeta | null
  unreadableReason: string | null
  price: PriceBreakdown | null
  payment: {
    method: PaymentMethod | null
    status: PaymentStatus
    orderRef: string
    reference: string
    due: number
    received: number
    excess: number
    qrData: string | null
    deadlineSec: number
    message: string | null
    refundNote: string | null
  }
  job: { id: string; status: PrintStatus; pagesTotal: number; pagesDone: number; message: string }
  savedAt: number
}

export interface KioskState {
  phase: Phase
  bootedAt: number
  online: boolean
  licenseOk: boolean
  printer: PrinterHealth
  prefs: { paper: PaperSize; color: ColorMode; copies: number }
  source: FileSource | null
  intake: {
    status: IntakeStatus
    progress: number
    message: string
    fileName: string | null
    timeoutSec: number
    usbFiles: UsbFile[]
  }
  doc: DocMeta | null
  unreadableReason: string | null
  scan: { progress: number; done: boolean }
  price: PriceBreakdown | null
  payment: {
    method: PaymentMethod | null
    status: PaymentStatus
    orderRef: string
    reference: string
    due: number
    received: number
    excess: number
    qrData: string | null
    deadlineSec: number
    message: string | null
    refundNote: string | null
  }
  job: { id: string; status: PrintStatus; pagesTotal: number; pagesDone: number; message: string }
  report: { code: ReportCode | null; note: string; submitted: boolean }
  recovery: { powerLostAt: number | null; savedPhase: Phase | null; saved: SavedSession | null }
  outage: { since: number | null; holding: boolean; resumePhase: Phase | null }
  idle: { warning: boolean; remainSec: number }
  notice: string | null
  devPanelOpen: boolean
  completedCopies: number
  fileDeleted: boolean
}

export type KioskEvent =
  | {
      type: 'BOOT_READY'
      online: boolean
      licenseOk: boolean
      printer: PrinterHealth
    }
  | {
      type: 'RECOVERY_FOUND'
      online: boolean
      licenseOk: boolean
      printer: PrinterHealth
      powerLostAt: number
      session: SavedSession
    }
  | { type: 'SYSTEM_STATUS'; online: boolean; licenseOk: boolean; printer: PrinterHealth }
  | { type: 'RETRY_SETUP' }
  | { type: 'RECHECK_PRINTER' }
  | { type: 'START_ORDER' }
  | { type: 'OPEN_RECOVERY' }
  | { type: 'RECOVERY_FOUND_NOTHING' }
  | { type: 'RESUME_RECOVERED' }
  | { type: 'DISCARD_RECOVERY' }
  | { type: 'SET_PAPER'; paper: PaperSize }
  | { type: 'SET_COLOR'; color: ColorMode }
  | { type: 'SET_COPIES'; copies: number }
  | { type: 'PREFS_NEXT' }
  | { type: 'PREFS_BACK' }
  | { type: 'PICK_SOURCE'; source: FileSource }
  | { type: 'SOURCE_BACK' }
  | { type: 'INTAKE_STATUS'; status: IntakeStatus; message?: string; fileName?: string; usbFiles?: UsbFile[] }
  | { type: 'INTAKE_PROGRESS'; progress: number }
  | { type: 'INTAKE_FAILED'; reason: string; kind: 'timeout' | 'error' }
  | { type: 'INTAKE_RECEIVED'; doc: DocMeta }
  | { type: 'INTAKE_PICK_FILE'; fileName: string }
  | { type: 'INTAKE_CANCEL' }
  | { type: 'SCAN_PROGRESS'; progress: number }
  | { type: 'SCAN_DONE' }
  | { type: 'SCAN_NEXT' }
  | { type: 'REPLACE_FILE' }
  | { type: 'REVIEW_NEXT' }
  | { type: 'REVIEW_CANCEL' }
  | { type: 'EDIT_PREFS' }
  | { type: 'SELECT_METHOD'; method: PaymentMethod }
  | { type: 'PAYMENT_BACK' }
  | { type: 'WALLET_CFG'; reference: string; qrData: string }
  | { type: 'CASH_INSERTED'; amount: number; total: number }
  | { type: 'CASH_ERROR'; message: string }
  | { type: 'WALLET_STATUS'; status: 'confirmed' | 'failed' | 'expired' }
  | { type: 'PAYMENT_RETRY' }
  | { type: 'PAYMENT_CANCEL' }
  | { type: 'PROCEED_PRINT' }
  | { type: 'JOB_START'; id: string; pagesTotal: number }
  | { type: 'JOB_EVENT'; status: PrintStatus; pagesDone?: number; message?: string }
  | { type: 'JOB_RETRY' }
  | { type: 'JOB_SUPPORT' }
  | { type: 'REPORT_OPEN' }
  | { type: 'DONE' }
  | { type: 'REPORT_SET'; code?: ReportCode | null; note?: string }
  | { type: 'REPORT_SUBMIT' }
  | { type: 'REPORT_BACK' }
  | { type: 'TICK' }
  | { type: 'ACTIVITY' }
  | { type: 'IDLE_WARN' }
  | { type: 'IDLE_DISMISS' }
  | { type: 'IDLE_EXPIRE' }
  | { type: 'OUTAGE_START'; resumePhase: Phase }
  | { type: 'OUTAGE_END' }
  | { type: 'TOGGLE_DEV' }
  | { type: 'DEV_CLOSE' }
  | { type: 'NOTICE'; message: string | null }
  | { type: 'FILE_DELETED' }
  | { type: 'RESET' }
