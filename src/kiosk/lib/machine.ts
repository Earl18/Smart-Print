import { computePrice } from './pricing'
import type { KioskEvent, KioskState, Phase, PrinterHealth } from './types'

export const COPIES_LIMIT = { min: 1, max: 10 }
export const CASH_TIMEOUT_SEC = 120
export const WALLET_TIMEOUT_SEC = 180
export const INTAKE_TIMEOUT_SEC = { qr: 180, bluetooth: 180, usb: 90 }
export const IDLE_WARN_SEC = 30

export const RESUMABLE_PHASES: Phase[] = [
  'PREFERENCES',
  'SOURCE_SELECT',
  'RECEIVING',
  'SCAN',
  'REVIEW',
  'PAYMENT_METHOD',
  'PAY_CASH',
  'PAY_EWALLET',
  'PRINTING',
]

const HOLDABLE_PHASES: Phase[] = RESUMABLE_PHASES
const IDLEABLE_PHASES: Phase[] = [
  'WELCOME',
  'PREFERENCES',
  'SOURCE_SELECT',
  'RECEIVING',
  'SCAN',
  'REVIEW',
  'PAYMENT_METHOD',
  'PAY_CASH',
  'PAY_EWALLET',
  'SUCCESS',
]

let refCounter = 0
export function makeRef(prefix: string): string {
  refCounter = (refCounter + 1) % 10000
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `${prefix}-${rand}`
}

const DEFAULT_PRINTER: PrinterHealth = { ready: true, paper: 'ok', message: 'Ready to print' }

function baseState(prev?: KioskState): KioskState {
  return {
    phase: 'WELCOME',
    bootedAt: prev?.bootedAt ?? Date.now(),
    online: prev?.online ?? true,
    licenseOk: prev?.licenseOk ?? true,
    printer: prev?.printer ?? DEFAULT_PRINTER,
    prefs: { paper: 'A4', color: 'bw', copies: 1 },
    source: null,
    intake: {
      status: 'idle',
      progress: 0,
      message: '',
      fileName: null,
      timeoutSec: INTAKE_TIMEOUT_SEC.qr,
      usbFiles: [],
    },
    doc: null,
    unreadableReason: null,
    scan: { progress: 0, done: false },
    price: null,
    payment: {
      method: null,
      status: 'awaiting',
      orderRef: '',
      reference: '',
      due: 0,
      received: 0,
      excess: 0,
      qrData: null,
      deadlineSec: 0,
      message: null,
      refundNote: null,
    },
    job: { id: '', status: 'idle', pagesTotal: 0, pagesDone: 0, message: '' },
    report: { code: null, note: '', submitted: false },
    recovery: { powerLostAt: null, savedPhase: null, saved: null },
    outage: { since: null, holding: false, resumePhase: null },
    idle: { warning: false, remainSec: IDLE_WARN_SEC },
    maintenance: { screen: 'closed', error: null, lockRemain: 0 },
    notice: null,
    devPanelOpen: prev?.devPanelOpen ?? false,
    completedCopies: 0,
    fileDeleted: false,
    offlineMode: false,
  }
}

export function initialState(): KioskState {
  return { ...baseState(), phase: 'BOOT' }
}

/** Discard the active order and return to the welcome screen. */
function discardToWelcome(state: KioskState, notice: string | null = null): KioskState {
  return { ...baseState(state), notice }
}

function timeoutFor(method: 'cash' | 'ewallet'): number {
  return method === 'cash' ? CASH_TIMEOUT_SEC : WALLET_TIMEOUT_SEC
}

export function reducer(state: KioskState, event: KioskEvent): KioskState {
  switch (event.type) {
    /* ---------------- boot / system ---------------- */
    case 'BOOT_READY': {
      const next: KioskState = {
        ...state,
        online: event.online,
        licenseOk: event.licenseOk,
        printer: event.printer,
        bootedAt: Date.now(),
        offlineMode: event.offlineMode ?? false,
      }
      // A kiosk configured for offline use intentionally runs without internet.
      if (!event.online && !next.offlineMode) return { ...next, phase: 'SETUP_REQUIRED' }
      if (!event.licenseOk) return { ...next, phase: 'SETUP_REQUIRED' }
      if (!event.printer.ready || event.printer.paper === 'out') return { ...next, phase: 'NOT_READY' }
      return { ...next, phase: 'WELCOME' }
    }
    case 'RECOVERY_FOUND': {
      return {
        ...state,
        online: event.online,
        licenseOk: event.licenseOk,
        printer: event.printer,
        bootedAt: Date.now(),
        offlineMode: event.offlineMode ?? false,
        phase: 'RECOVERY_PROMPT',
        recovery: {
          powerLostAt: event.powerLostAt,
          savedPhase: event.session.phase,
          saved: event.session,
        },
      }
    }
    case 'SYSTEM_STATUS': {
      const offline = !event.online && !state.offlineMode
      let outage = state.outage
      let phase = state.phase
      if (offline && !state.outage.holding && state.outage.since === null && HOLDABLE_PHASES.includes(state.phase)) {
        outage = { ...state.outage, since: Date.now() }
      }
      if (!offline) {
        outage = { since: null, holding: false, resumePhase: null }
        if (state.outage.holding) {
          phase = state.outage.resumePhase ?? 'WELCOME'
          if (phase === 'PAY_CASH' || phase === 'PAY_EWALLET') {
            return applyAfterOutageResume({ ...state, outage, phase })
          }
        }
      }
      const next: KioskState = { ...state, online: event.online, licenseOk: event.licenseOk, printer: event.printer, outage, phase }
      // Auto-heal the "printer needs attention" gate once it is ready again.
      if (phase === 'NOT_READY' && event.printer.ready && event.printer.paper !== 'out') {
        return { ...next, phase: 'WELCOME', notice: 'Printer is ready again.' }
      }
      return next
    }
    case 'RETRY_SETUP':
    case 'RECHECK_PRINTER':
      return { ...state, phase: 'BOOT', notice: null }
    case 'NOTICE':
      return { ...state, notice: event.message }

    /* ---------------- recovery ---------------- */
    case 'RECOVERY_FOUND_NOTHING':
      return { ...state, notice: 'Nothing to recover — no unfinished transaction was found on this kiosk.' }
    case 'RESUME_RECOVERED': {
      const saved = state.recovery.saved
      if (!saved) return discardToWelcome(state)
      const phase =
        saved.phase === 'RECEIVING' ? 'SOURCE_SELECT' : saved.phase
      const doc = phase === 'SOURCE_SELECT' ? null : saved.doc
      const price = doc && saved.price ? saved.price : doc ? computePrice(saved.prefs, doc) : null
      return {
        ...baseState(state),
        phase,
        prefs: saved.prefs,
        source: saved.source,
        doc,
        unreadableReason: phase === 'SOURCE_SELECT' ? null : saved.unreadableReason,
        scan: { progress: 100, done: phase !== 'SOURCE_SELECT' },
        price,
        payment:
          phase === 'PAY_CASH' || phase === 'PAY_EWALLET'
            ? {
                ...saved.payment,
                status: 'awaiting',
                deadlineSec: timeoutFor(saved.payment.method === 'ewallet' ? 'ewallet' : 'cash'),
                qrData: phase === 'PAY_EWALLET' ? null : saved.payment.qrData,
                message: null,
                refundNote: null,
              }
            : saved.payment,
        job:
          phase === 'PRINTING'
            ? { ...saved.job, status: 'idle', message: 'Power restored — re-queueing your job' }
            : saved.job,
        notice: 'Power restored — your transaction was recovered.',
      }
    }
    case 'DISCARD_RECOVERY':
      return discardToWelcome(state, null)

    /* ---------------- preferences ---------------- */
    case 'START_ORDER':
      return {
        ...baseState(state),
        phase: 'PREFERENCES',
        payment: { ...baseState(state).payment, orderRef: makeRef('SP') },
        notice: state.notice,
      }
    case 'OPEN_RECOVERY':
      // Handled by the orchestration hook (reads storage) — the reducer no-ops.
      return state
    case 'SET_PAPER': {
      const prefs = { ...state.prefs, paper: event.paper }
      return { ...state, prefs, price: state.doc ? computePrice(prefs, state.doc) : null }
    }
    case 'SET_COLOR': {
      const prefs = { ...state.prefs, color: event.color }
      return { ...state, prefs, price: state.doc ? computePrice(prefs, state.doc) : null }
    }
    case 'SET_COPIES': {
      const copies = Math.min(COPIES_LIMIT.max, Math.max(COPIES_LIMIT.min, event.copies))
      const prefs = { ...state.prefs, copies }
      return { ...state, prefs, price: state.doc ? computePrice(prefs, state.doc) : null }
    }
    case 'PREFS_NEXT':
      return { ...state, phase: 'SOURCE_SELECT' }
    case 'PREFS_BACK':
      return { ...state, phase: 'WELCOME' }

    /* ---------------- file intake ---------------- */
    case 'PICK_SOURCE': {
      if (event.source === 'qr' && !state.online) return state
      return {
        ...state,
        phase: 'RECEIVING',
        source: event.source,
        intake: {
          status: 'waiting',
          progress: 0,
          message: '',
          fileName: null,
          timeoutSec: INTAKE_TIMEOUT_SEC[event.source],
          usbFiles: [],
        },
      }
    }
    case 'SOURCE_BACK':
      return { ...state, phase: 'PREFERENCES' }
    case 'INTAKE_STATUS': {
      if (state.phase !== 'RECEIVING') return state
      return {
        ...state,
        intake: {
          ...state.intake,
          status: event.status,
          message: event.message ?? state.intake.message,
          fileName: event.fileName ?? state.intake.fileName,
          usbFiles: event.usbFiles ?? state.intake.usbFiles,
        },
      }
    }
    case 'INTAKE_PROGRESS':
      if (state.phase !== 'RECEIVING') return state
      return { ...state, intake: { ...state.intake, progress: Math.max(state.intake.progress, event.progress) } }
    case 'INTAKE_FAILED': {
      if (state.phase !== 'RECEIVING') return state
      return {
        ...state,
        intake: {
          ...state.intake,
          status: event.kind === 'timeout' ? 'timeout' : 'error',
          message: event.reason,
        },
      }
    }
    case 'INTAKE_RECEIVED': {
      if (state.phase !== 'RECEIVING') return state
      return {
        ...state,
        phase: 'SCAN',
        doc: event.doc,
        unreadableReason: null,
        scan: { progress: 0, done: false },
      }
    }
    case 'INTAKE_PICK_FILE': {
      if (state.phase !== 'RECEIVING') return state
      return {
        ...state,
        intake: {
          ...state.intake,
          status: 'receiving',
          fileName: event.fileName,
          message: `Receiving ${event.fileName}…`,
        },
      }
    }
    case 'INTAKE_CANCEL':
      if (state.phase !== 'RECEIVING') return state
      return {
        ...state,
        phase: 'SOURCE_SELECT',
        intake: { ...baseState(state).intake, timeoutSec: state.source ? INTAKE_TIMEOUT_SEC[state.source] : 120 },
      }

    /* ---------------- scan ---------------- */
    case 'SCAN_PROGRESS':
      if (state.phase !== 'SCAN') return state
      return { ...state, scan: { ...state.scan, progress: Math.min(100, event.progress) } }
    case 'SCAN_DONE': {
      if (state.phase !== 'SCAN' || !state.doc) return state
      const unreadable = Boolean(state.doc.unreadableReason) || state.doc.pages < 1 || state.doc.kind === 'unknown'
      const reason =
        state.doc.unreadableReason ??
        'The kiosk could not read this file. It may be damaged or in a format that is not supported.'
      if (unreadable) return { ...state, scan: { ...state.scan, done: true }, unreadableReason: reason }
      return {
        ...state,
        scan: { ...state.scan, done: true },
        price: computePrice(state.prefs, state.doc),
      }
    }
    case 'SCAN_NEXT':
      if (state.phase !== 'SCAN' || !state.price) return state
      return { ...state, phase: 'REVIEW' }
    case 'REPLACE_FILE':
      return {
        ...state,
        phase: 'SOURCE_SELECT',
        doc: null,
        unreadableReason: null,
        price: null,
        scan: { progress: 0, done: false },
        intake: baseState(state).intake,
      }

    /* ---------------- review ---------------- */
    case 'REVIEW_NEXT': {
      if (!state.price) return state
      if (!state.printer.ready || state.printer.paper === 'out') return { ...state, phase: 'NOT_READY' }
      return { ...state, phase: 'PAYMENT_METHOD' }
    }
    case 'REVIEW_CANCEL':
      return discardToWelcome(state)
    case 'EDIT_PREFS':
      return { ...state, phase: 'PREFERENCES' }

    /* ---------------- payment ---------------- */
    case 'SELECT_METHOD': {
      if (!state.price) return state
      if (event.method === 'ewallet' && !state.online) return state
      return {
        ...state,
        phase: event.method === 'cash' ? 'PAY_CASH' : 'PAY_EWALLET',
        payment: {
          method: event.method,
          status: 'awaiting',
          orderRef: state.payment.orderRef || makeRef('SP'),
          reference: makeRef(event.method === 'cash' ? 'CSH' : 'EW'),
          due: state.price.total,
          received: 0,
          excess: 0,
          qrData: null,
          deadlineSec: timeoutFor(event.method),
          message: null,
          refundNote: null,
        },
      }
    }
    case 'PAYMENT_BACK':
      return { ...state, phase: 'REVIEW' }
    case 'WALLET_CFG':
      if (state.phase !== 'PAY_EWALLET') return state
      return { ...state, payment: { ...state.payment, reference: event.reference, qrData: event.qrData } }
    case 'CASH_INSERTED': {
      if (state.phase !== 'PAY_CASH' || state.payment.status !== 'awaiting') return state
      const received = event.total
      const excess = Math.max(0, received - state.payment.due)
      return {
        ...state,
        payment: {
          ...state.payment,
          received,
          excess,
          status: received >= state.payment.due ? 'confirmed' : 'awaiting',
        },
      }
    }
    case 'CASH_ERROR': {
      if (state.phase !== 'PAY_CASH' || state.payment.status !== 'awaiting') return state
      return {
        ...state,
        payment: {
          ...state.payment,
          status: 'failed',
          message: event.message,
          refundNote:
            state.payment.received > 0
              ? 'The money you inserted has been returned to the cash return slot.'
              : null,
        },
      }
    }
    case 'WALLET_STATUS': {
      if (state.phase !== 'PAY_EWALLET' || state.payment.status !== 'awaiting') return state
      if (event.status === 'confirmed') return { ...state, payment: { ...state.payment, status: 'confirmed' } }
      return {
        ...state,
        payment: {
          ...state.payment,
          status: event.status,
          message:
            event.status === 'failed'
              ? 'The e-wallet payment failed. No money was charged.'
              : 'The e-wallet payment expired. No money was charged.',
        },
      }
    }
    case 'PAYMENT_RETRY':
      return {
        ...state,
        payment: {
          ...state.payment,
          status: 'awaiting',
          received: 0,
          excess: 0,
          qrData: null,
          reference: makeRef(state.payment.method === 'cash' ? 'CSH' : 'EW'),
          deadlineSec: timeoutFor(state.payment.method === 'ewallet' ? 'ewallet' : 'cash'),
          message: null,
          refundNote: null,
        },
      }
    case 'PAYMENT_CANCEL': {
      const wasCash = state.payment.method === 'cash'
      const refundNote =
        wasCash && state.payment.received > 0
          ? `Your ₱${state.payment.received} was returned at the cash return slot.`
          : null
      return {
        ...state,
        phase: 'PAYMENT_METHOD',
        notice: refundNote,
        payment: {
          ...state.payment,
          status: 'awaiting',
          received: 0,
          excess: 0,
          qrData: null,
          deadlineSec: 0,
          message: null,
          refundNote,
        },
      }
    }
    case 'PROCEED_PRINT': {
      if (state.payment.status !== 'confirmed') return state
      return {
        ...state,
        phase: 'PRINTING',
        job: {
          id: makeRef('JOB'),
          status: 'idle',
          pagesTotal: (state.price?.pages ?? 1) * state.prefs.copies,
          pagesDone: 0,
          message: 'Preparing your print job',
        },
      }
    }

    /* ---------------- printing ---------------- */
    case 'JOB_START':
      return {
        ...state,
        job: { ...state.job, id: event.id, pagesTotal: event.pagesTotal, status: 'queued', message: 'Waiting for the printer' },
      }
    case 'JOB_EVENT': {
      if (state.phase !== 'PRINTING' && state.phase !== 'REPORT_PROBLEM') return state
      const job = {
        ...state.job,
        status: event.status,
        pagesDone: event.pagesDone ?? state.job.pagesDone,
        message: event.message ?? state.job.message,
      }
      if (event.status === 'completed') {
        return {
          ...state,
          phase: 'SUCCESS',
          job,
          completedCopies: state.prefs.copies,
        }
      }
      return { ...state, job }
    }
    case 'JOB_RETRY':
      return { ...state, job: { ...state.job, status: 'queued', message: 'Resuming your print job' } }
    case 'JOB_SUPPORT':
      return { ...state, phase: 'REPORT_PROBLEM', report: { code: null, note: '', submitted: false } }
    case 'REPORT_OPEN':
      return { ...state, phase: 'REPORT_PROBLEM', report: { code: null, note: '', submitted: false } }

    /* ---------------- success / report ---------------- */
    case 'DONE':
      return discardToWelcome(state)
    case 'REPORT_SET':
      return {
        ...state,
        report: {
          ...state.report,
          code: event.code !== undefined ? event.code : state.report.code,
          note: event.note !== undefined ? event.note : state.report.note,
        },
      }
    case 'REPORT_SUBMIT':
      return { ...state, report: { ...state.report, submitted: true } }
    case 'REPORT_BACK':
      return { ...state, phase: state.job.status === 'completed' ? 'SUCCESS' : 'PRINTING' }

    /* ---------------- first-time setup / website / maintenance ---------------- */
    case 'SETUP_START':
      return { ...state, phase: 'FIRST_RUN_SETUP', notice: null }
    case 'SETUP_COMPLETE':
      // Configuration is stored by the setup wizard; boot re-checks and gates as usual.
      return { ...baseState(state), phase: 'BOOT', bootedAt: Date.now() }
    case 'OPEN_WEBSITE':
      if (state.phase !== 'WELCOME' || !state.online) return state
      return { ...state, phase: 'WEBSITE', notice: null }
    case 'WEBSITE_CLOSE':
      if (state.phase !== 'WEBSITE') return state
      return { ...state, phase: 'WELCOME' }
    case 'MAINTENANCE_OPEN':
      return {
        ...state,
        maintenance: {
          screen: 'pin',
          error: null,
          // Restore any service-level lockout (e.g. after a power cycle).
          lockRemain: event.lockedFor ?? 0,
        },
      }
    case 'MAINTENANCE_CLOSE':
      return { ...state, maintenance: { screen: 'closed', error: null, lockRemain: 0 } }
    case 'MAINTENANCE_PIN_RESULT':
      if (event.ok) {
        return { ...state, maintenance: { screen: 'open', error: null, lockRemain: 0 } }
      }
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          error: event.message,
          lockRemain: event.lockedFor ?? 0,
        },
      }
    case 'MAINTENANCE_RESET':
      // Held customer sessions in storage are kept; boot re-enters first-time setup.
      return { ...baseState(state), phase: 'BOOT', bootedAt: Date.now() }

    /* ---------------- timers ---------------- */
    case 'TICK': {
      let next = state
      // payment countdown
      if (
        (state.phase === 'PAY_CASH' || state.phase === 'PAY_EWALLET') &&
        state.payment.status === 'awaiting' &&
        state.payment.deadlineSec > 0
      ) {
        const deadlineSec = state.payment.deadlineSec - 1
        next = {
          ...next,
          payment:
            deadlineSec <= 0
              ? {
                  ...next.payment,
                  deadlineSec: 0,
                  status: 'expired',
                  message:
                    next.payment.method === 'cash'
                      ? next.payment.received > 0
                        ? 'Time ran out. The money you inserted has been returned to the cash return slot.'
                        : 'Time ran out before any money was inserted.'
                      : 'Time ran out. The payment request expired and no money was charged.',
                }
              : { ...next.payment, deadlineSec },
        }
      }
      // intake countdown
      if (
        state.phase === 'RECEIVING' &&
        ['waiting', 'reading', 'ready', 'receiving'].includes(state.intake.status) &&
        state.intake.timeoutSec > 0
      ) {
        const timeoutSec = state.intake.timeoutSec - 1
        next = {
          ...next,
          intake:
            timeoutSec <= 0
              ? {
                  ...next.intake,
                  timeoutSec: 0,
                  status: 'timeout',
                  message: 'We did not receive a file in time.',
                }
              : { ...next.intake, timeoutSec },
        }
      }
      // inactivity countdown
      if (state.idle.warning) {
        const remainSec = state.idle.remainSec - 1
        if (remainSec <= 0) {
          return discardToWelcome({ ...next, idle: { warning: false, remainSec: IDLE_WARN_SEC } }, 'Session ended after inactivity. Nothing was charged.')
        }
        next = { ...next, idle: { ...next.idle, remainSec } }
      }
      // maintenance lockout countdown
      if (next.maintenance.lockRemain > 0) {
        next = {
          ...next,
          maintenance: {
            ...next.maintenance,
            lockRemain: next.maintenance.lockRemain - 1,
            error: next.maintenance.lockRemain - 1 <= 0 ? null : next.maintenance.error,
          },
        }
      }
      return next
    }

    /* ---------------- inactivity ---------------- */
    case 'IDLE_WARN':
      if (!IDLEABLE_PHASES.includes(state.phase) || state.idle.warning) return state
      return { ...state, idle: { warning: true, remainSec: IDLE_WARN_SEC } }
    case 'ACTIVITY':
      if (!state.idle.warning) return state
      return { ...state, idle: { warning: false, remainSec: IDLE_WARN_SEC } }
    case 'IDLE_DISMISS':
      return { ...state, idle: { warning: false, remainSec: IDLE_WARN_SEC } }
    case 'IDLE_EXPIRE':
      return discardToWelcome({ ...state, idle: { warning: false, remainSec: IDLE_WARN_SEC } }, 'Session ended after inactivity. Nothing was charged.')

    /* ---------------- outage hold ---------------- */
    case 'OUTAGE_START':
      if (state.outage.holding) return state
      return { ...state, phase: 'OUTAGE_HOLD', outage: { since: state.outage.since, holding: true, resumePhase: event.resumePhase } }
    case 'OUTAGE_END': {
      const resumePhase = state.outage.resumePhase ?? 'WELCOME'
      return applyAfterOutageResume({
        ...state,
        phase: resumePhase,
        outage: { since: null, holding: false, resumePhase: null },
      })
    }

    /* ---------------- dev / operator ---------------- */
    case 'TOGGLE_DEV':
      return { ...state, devPanelOpen: !state.devPanelOpen }
    case 'DEV_CLOSE':
      return { ...state, devPanelOpen: false }
    case 'FILE_DELETED':
      return { ...state, fileDeleted: true }
    case 'RESET':
      return discardToWelcome(state)

    default:
      return state
  }
}

function applyAfterOutageResume(state: KioskState): KioskState {
  const phase = state.phase
  if (phase === 'PAY_CASH' || phase === 'PAY_EWALLET') {
    return {
      ...state,
      payment: {
        ...state.payment,
        deadlineSec:
          state.payment.status === 'awaiting' ? timeoutFor(phase === 'PAY_CASH' ? 'cash' : 'ewallet') : state.payment.deadlineSec,
      },
    }
  }
  return state
}
