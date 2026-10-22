'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { IDLE_WARN_SEC, initialState, reducer, RESUMABLE_PHASES } from './machine'
import type { KioskEvent, KioskState } from './types'
import { docForPhoneFile } from '@/kiosk/services/intake'
import {
  cashService,
  intakeService,
  kioskConfigService,
  printerService,
  storageService,
  systemService,
  walletService,
} from '@/kiosk/services'

const IDLE_WARN_AFTER_MS = 90_000
const OUTAGE_HOLD_AFTER_MS = 20_000
const CONFIRMED_TO_PRINT_MS = 1600

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs the kiosk state machine and wires every hardware service to it.
 * All side effects (timers, service events, persistence) live here —
 * the reducer itself stays pure.
 */
export function useKioskMachine(): { state: KioskState; dispatch: (event: KioskEvent) => void } {
  const [state, rawDispatch] = useReducer(reducer, undefined, initialState)
  const stateRef = useRef(state)
  const activityRef = useRef(Date.now())

  useEffect(() => {
    stateRef.current = state
  }, [state])

  /* Wrap dispatch: some events need a service round-trip before they reach
     the reducer (recovery lookup, PIN verification, kiosk reset). */
  const dispatch = useCallback((event: KioskEvent) => {
    if (
      event.type === 'IDLE_DISMISS' ||
      event.type === 'IDLE_EXPIRE' ||
      event.type === 'RESET' ||
      event.type === 'MAINTENANCE_CONFIRM_RESET' ||
      event.type === 'ACTIVITY' ||
      (event.type === 'TICK' && stateRef.current.idle.warning && stateRef.current.idle.remainSec <= 1)
    ) {
      activityRef.current = Date.now()
    }
    if (event.type === 'OPEN_RECOVERY') {
      const stored = storageService.load()
      const s = stored.session
      if (s && RESUMABLE_PHASES.includes(s.phase)) {
        rawDispatch({
          type: 'RECOVERY_FOUND',
          online: stateRef.current.online,
          licenseOk: stateRef.current.licenseOk,
          printer: stateRef.current.printer,
          powerLostAt: stored.powerLostAt ?? s.savedAt,
          session: s,
          offlineMode: stateRef.current.offlineMode,
        })
      } else {
        rawDispatch({ type: 'RECOVERY_FOUND_NOTHING' })
      }
      return
    }
    if (event.type === 'MAINTENANCE_OPEN') {
      // Re-attach any lockout that is still active at the service level.
      rawDispatch({ type: 'MAINTENANCE_OPEN', lockedFor: kioskConfigService.pinLockRemaining() })
      return
    }
    if (event.type === 'MAINTENANCE_SUBMIT_PIN') {
      const res = kioskConfigService.verifyOperatorPin(event.pin)
      rawDispatch(
        res.ok
          ? { type: 'MAINTENANCE_PIN_RESULT', ok: true, message: null, lockedFor: 0 }
          : {
              type: 'MAINTENANCE_PIN_RESULT',
              ok: false,
              message:
                res.lockedFor > 0
                  ? `Maintenance is locked. Try again in ${res.lockedFor} seconds.`
                  : 'Incorrect PIN. Try again.',
              lockedFor: res.lockedFor,
            },
      )
      return
    }
    if (event.type === 'MAINTENANCE_CONFIRM_RESET') {
      // Clears license + configuration; held customer sessions are kept.
      kioskConfigService.resetKiosk()
      rawDispatch({ type: 'MAINTENANCE_RESET' })
      rawDispatch({ type: 'DEV_CLOSE' })
      return
    }
    rawDispatch(event)
  }, [])

  /* ---------- boot / setup re-check ---------- */
  useEffect(() => {
    if (state.phase !== 'BOOT') return
    let cancelled = false
    const run = async () => {
      await delay(1100)
      if (cancelled) return
      const sys = systemService.check()
      const printer = await printerService.health()
      if (cancelled) return
      const cfg = kioskConfigService.load()
      // A factory-fresh (or reset) kiosk must be provisioned before customers
      // can reach any other screen.
      if (!cfg) {
        rawDispatch({ type: 'SETUP_START' })
        return
      }
      const online = cfg.mode === 'offline' ? false : sys.online
      const offlineMode = cfg.mode === 'offline'
      const stored = storageService.load()
      const resumable =
        stored.session !== null && RESUMABLE_PHASES.includes(stored.session.phase)
      /* Returning from the phone upload page (?returned=1) resumes the
         saved session straight away instead of showing the recovery prompt. */
      const autoResume =
        !stored.powerLostAt &&
        resumable &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('returned')
      if (autoResume && stored.session) {
        const saved = stored.session
        dispatch({
          type: 'RECOVERY_FOUND',
          online,
          licenseOk: sys.licenseOk,
          printer,
          powerLostAt: stored.powerLostAt ?? saved.savedAt,
          session: saved,
          offlineMode,
        })
        // Restore the saved slice first (prefs, price, order ref) — the
        // reducer lands on SOURCE_SELECT for sessions saved while receiving.
        dispatch({ type: 'RESUME_RECOVERED' })
        if (saved.phase === 'RECEIVING' && saved.source === 'qr') {
          // A file may already be waiting on the upload service — re-enter
          // the QR channel and hand the file straight to the scan step.
          try {
            const res = await fetch(`/api/upload/file?sessionId=${encodeURIComponent(saved.payment.orderRef)}`, {
              cache: 'no-store',
            })
            const data = (await res.json()) as {
              status: string
              file?: { fileName: string; sizeBytes: number; fileType: string }
            }
            if (data.status === 'received' && data.file) {
              dispatch({ type: 'PICK_SOURCE', source: 'qr' })
              dispatch({ type: 'INTAKE_RECEIVED', doc: docForPhoneFile(data.file) })
              void fetch(`/api/upload/file?sessionId=${encodeURIComponent(saved.payment.orderRef)}`, {
                method: 'DELETE',
              })
              return
            }
          } catch {
            /* upload service unreachable — stay on the resumed step */
          }
        }
        return
      }
      if (stored.powerLostAt && stored.session && resumable) {
        dispatch({
          type: 'RECOVERY_FOUND',
          online,
          licenseOk: sys.licenseOk,
          printer,
          powerLostAt: stored.powerLostAt,
          session: stored.session,
          offlineMode,
        })
        return
      }
      if (stored.powerLostAt) storageService.clear()
      dispatch({ type: 'BOOT_READY', online, licenseOk: sys.licenseOk, printer, offlineMode })
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [state.phase])

  /* ---------- service → machine subscriptions ---------- */
  useEffect(() => {
    const unsubs = [
      printerService.on('status', (p) =>
        dispatch({ type: 'JOB_EVENT', status: p.status, pagesDone: p.pagesDone, message: p.message }),
      ),
      cashService.onInserted((p) => dispatch({ type: 'CASH_INSERTED', amount: p.amount, total: p.total })),
      cashService.onError((p) => dispatch({ type: 'CASH_ERROR', message: p.message })),
      walletService.on('status', (p) => {
        if (p.status !== 'awaiting') dispatch({ type: 'WALLET_STATUS', status: p.status })
      }),
      intakeService.on('status', (p) =>
        dispatch({
          type: 'INTAKE_STATUS',
          status: p.status,
          message: p.message,
          fileName: p.fileName,
          usbFiles: p.usbFiles,
        }),
      ),
      intakeService.on('progress', (p) => dispatch({ type: 'INTAKE_PROGRESS', progress: p.progress })),
      intakeService.on('received', (p) => dispatch({ type: 'INTAKE_RECEIVED', doc: p.doc })),
      intakeService.on('failed', (p) => dispatch({ type: 'INTAKE_FAILED', reason: p.reason, kind: p.kind })),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  /* ---------- 1s heartbeat: countdowns, idle, outage escalation ---------- */
  useEffect(() => {
    const iv = setInterval(() => {
      const s = stateRef.current
      dispatch({ type: 'TICK' })
      if (
        !s.idle.warning &&
        Date.now() - activityRef.current > IDLE_WARN_AFTER_MS
      ) {
        dispatch({ type: 'IDLE_WARN' })
      }
      if (s.outage.since !== null && !s.outage.holding && Date.now() - s.outage.since > OUTAGE_HOLD_AFTER_MS) {
        dispatch({ type: 'OUTAGE_START', resumePhase: s.phase })
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  /* ---------- periodic system & printer self-check ---------- */
  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      const sys = systemService.check()
      const printer = await printerService.health()
      if (cancelled) return
      const cfg = kioskConfigService.load()
      const online = cfg?.mode === 'offline' ? false : sys.online
      dispatch({ type: 'SYSTEM_STATUS', online, licenseOk: sys.licenseOk, printer })
    }
    const iv = setInterval(() => void poll(), 4000)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
  }, [])

  /* ---------- global listeners: activity, context menu, operator keys ---------- */
  useEffect(() => {
    const onActivity = () => {
      activityRef.current = Date.now()
    }
    const onContextMenu = (e: MouseEvent) => e.preventDefault()
    const onKeyDown = (e: KeyboardEvent) => {
      // Operator panel: Ctrl+Shift+F9 (never exposed in the customer UI)
      if (e.ctrlKey && e.shiftKey && e.key === 'F9') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_DEV' })
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        if (stateRef.current.devPanelOpen) dispatch({ type: 'DEV_CLOSE' })
      }
    }
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('click', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('click', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  /* ---------- persistence (power recovery) ----------
     Setup and maintenance phases hold no customer data — never overwrite
     a held transaction with them. A held transaction also stays recoverable
     while the kiosk waits at the welcome screen (after setup, reset or a
     boot); starting a fresh order replaces it. */
  useEffect(() => {
    if (state.phase === 'BOOT' || state.phase === 'FIRST_RUN_SETUP') return
    if (state.phase === 'WELCOME') {
      const stored = storageService.load()
      if (stored.session && RESUMABLE_PHASES.includes(stored.session.phase)) return
    }
    storageService.save(state)
  }, [state])

  /* ---------- phase entry effects ---------- */
  useEffect(() => {
    const s = stateRef.current
    if (s.phase === 'RECEIVING') {
      if (s.source) intakeService.start(s.source)
    } else {
      intakeService.cancel()
    }
    if (s.phase === 'PAY_CASH') {
      cashService.beginSession(s.payment.due)
    } else {
      cashService.endSession()
    }
    if (s.phase === 'SUCCESS') {
      storageService.deleteFile()
      dispatch({ type: 'FILE_DELETED' })
      printerService.reset()
    }
  }, [state.phase])

  /* ---------- receiving: USB file picked → start the transfer ---------- */
  useEffect(() => {
    if (
      state.phase === 'RECEIVING' &&
      state.source === 'usb' &&
      state.intake.status === 'receiving' &&
      state.intake.fileName &&
      state.intake.progress === 0
    ) {
      intakeService.pickUsbFile(state.intake.fileName)
    }
  }, [state.phase, state.intake.status, state.intake.fileName])

  /* ---------- phone upload: register the session while the QR screen shows ---- */
  useEffect(() => {
    if (state.phase !== 'RECEIVING' || state.source !== 'qr') return
    const s = stateRef.current
    const sessionId = s.payment.orderRef || 'SP-TEMP'
    const controller = new AbortController()
    void fetch('/api/upload/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        kioskName: kioskConfigService.load()?.license.kioskName ?? 'Smart Print kiosk',
        prefs: s.prefs,
      }),
      signal: controller.signal,
    }).catch(() => {
      /* The demo upload does not depend on session registration. */
    })
    return () => controller.abort()
  }, [state.phase, state.source, state.payment.orderRef, state.prefs])

  /* ---------- phone upload: poll for the file sent from the phone ---------- */
  useEffect(() => {
    if (state.phase !== 'RECEIVING' || state.source !== 'qr') return
    const sessionId = stateRef.current.payment.orderRef || 'SP-TEMP'
    let stop = false
    const poll = async () => {
      try {
        const res = await fetch(`/api/upload/file?sessionId=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          status: string
          file?: { fileName: string; sizeBytes: number; fileType: string }
        }
        if (stop) return
        if (data.status === 'received' && data.file) {
          dispatch({ type: 'INTAKE_RECEIVED', doc: docForPhoneFile(data.file) })
          void fetch(`/api/upload/file?sessionId=${encodeURIComponent(sessionId)}`, { method: 'DELETE' })
        }
      } catch {
        /* keep polling — the phone may still be sending */
      }
    }
    void poll()
    const iv = setInterval(() => void poll(), 2000)
    return () => {
      stop = true
      clearInterval(iv)
    }
  }, [state.phase, state.source])

  /* ---------- receiving: cancel intake when it times out or errors ---------- */
  useEffect(() => {
    if (state.phase === 'RECEIVING' && (state.intake.status === 'timeout' || state.intake.status === 'error')) {
      intakeService.cancel()
    }
  }, [state.phase, state.intake.status])

  /* ---------- scan: animated document scan ---------- */
  useEffect(() => {
    if (state.phase !== 'SCAN' || state.scan.done) return
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    const iv = setInterval(() => {
      const p = stateRef.current.scan.progress + 7
      if (p >= 100) {
        clearInterval(iv)
        dispatch({ type: 'SCAN_PROGRESS', progress: 100 })
        timeout = setTimeout(() => {
          if (!cancelled) dispatch({ type: 'SCAN_DONE' })
        }, 400)
      } else {
        dispatch({ type: 'SCAN_PROGRESS', progress: p })
      }
    }, 300)
    return () => {
      cancelled = true
      clearInterval(iv)
      if (timeout) clearTimeout(timeout)
    }
  }, [state.phase, state.scan.done])

  /* ---------- e-wallet: create the payment request ---------- */
  useEffect(() => {
    if (state.phase !== 'PAY_EWALLET') return
    const s = stateRef.current
    if (s.payment.status !== 'awaiting') return
    if (s.payment.qrData) return
    const req = walletService.create(s.payment.due, s.payment.orderRef)
    dispatch({ type: 'WALLET_CFG', reference: req.reference, qrData: req.qrData })
  }, [state.phase, state.payment.reference, state.payment.status])

  /* ---------- payment confirmed → brief receipt moment → printing ---------- */
  useEffect(() => {
    const confirmed =
      (state.phase === 'PAY_CASH' || state.phase === 'PAY_EWALLET') && state.payment.status === 'confirmed'
    if (!confirmed) return
    const t = setTimeout(() => dispatch({ type: 'PROCEED_PRINT' }), CONFIRMED_TO_PRINT_MS)
    return () => clearTimeout(t)
  }, [state.phase, state.payment.status])

  /* ---------- printing: enqueue the paid job ---------- */
  useEffect(() => {
    if (state.phase !== 'PRINTING' || state.job.status !== 'idle') return
    const s = stateRef.current
    const pages = s.price?.pages ?? 1
    const pagesTotal = pages * s.prefs.copies
    dispatch({ type: 'JOB_START', id: s.job.id, pagesTotal })
    printerService.enqueue({ id: s.job.id, pages, copies: s.prefs.copies })
  }, [state.phase, state.job.status])

  /* ---------- cash: (re)begin the acceptor session on entry and retry ---------- */
  useEffect(() => {
    if (state.phase === 'PAY_CASH' && state.payment.status === 'awaiting') {
      cashService.beginSession(stateRef.current.payment.due)
    }
  }, [state.phase, state.payment.status, state.payment.reference])

  /* ---------- printing: resume the paused printer after a fault retry ---------- */
  useEffect(() => {
    if (state.phase === 'PRINTING' && state.job.status === 'queued') {
      printerService.resume()
    }
  }, [state.phase, state.job.status])

  return { state, dispatch }
}
