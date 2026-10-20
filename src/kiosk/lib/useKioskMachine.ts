'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { IDLE_WARN_SEC, initialState, reducer, RESUMABLE_PHASES } from './machine'
import type { KioskEvent, KioskState } from './types'
import { cashService, intakeService, printerService, storageService, systemService, walletService } from '@/kiosk/services'

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
  stateRef.current = state
  const activityRef = useRef(Date.now())

  /* Wrap dispatch: "recover previous transaction" reads storage, then feeds
     the same RECOVERY_FOUND event the boot sequence uses. */
  const dispatch = useCallback((event: KioskEvent) => {
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
        })
      } else {
        rawDispatch({ type: 'RECOVERY_FOUND_NOTHING' })
      }
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
      const stored = storageService.load()
      const resumable =
        stored.session !== null && RESUMABLE_PHASES.includes(stored.session.phase)
      if (stored.powerLostAt && stored.session && resumable) {
        dispatch({
          type: 'RECOVERY_FOUND',
          online: sys.online,
          licenseOk: sys.licenseOk,
          printer,
          powerLostAt: stored.powerLostAt,
          session: stored.session,
        })
        return
      }
      if (stored.powerLostAt) storageService.clear()
      dispatch({ type: 'BOOT_READY', online: sys.online, licenseOk: sys.licenseOk, printer })
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
      dispatch({ type: 'SYSTEM_STATUS', online: sys.online, licenseOk: sys.licenseOk, printer })
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
      if (stateRef.current.idle.warning) dispatch({ type: 'ACTIVITY' })
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

  /* ---------- persistence (power recovery) ---------- */
  useEffect(() => {
    if (state.phase === 'BOOT') return
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
