import { TypedEmitter, type Unsubscribe } from '@/kiosk/lib/emitter'
import type { PrintStatus } from '@/kiosk/lib/types'
import type { PrinterJobSpec, PrinterService, PrinterStatusEvent } from './types'

type Timers = Array<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>>

/**
 * In-memory printer. Emits the same event sequence a real driver would:
 * queued → printing → progress… → completed, plus jam / out-of-paper faults.
 */
export class InMemoryPrinterService implements PrinterService {
  private emitter = new TypedEmitter<{ status: PrinterStatusEvent }>()
  private healthState = { ready: true, paper: 'ok' as 'ok' | 'low' | 'out', message: 'Ready to print' }
  private job: { spec: PrinterJobSpec; pagesDone: number; paused: boolean } | null = null
  private timers: Timers = []

  async health() {
    return { ...this.healthState }
  }

  on(event: 'status', cb: (payload: PrinterStatusEvent) => void): Unsubscribe {
    return this.emitter.on(event, cb)
  }

  enqueue(spec: PrinterJobSpec): void {
    this.clearTimers()
    this.job = { spec, pagesDone: 0, paused: false }
    this.healthState = { ready: true, paper: 'ok', message: 'Ready to print' }
    this.after(1400, () => {
      this.emitStatus('queued', { message: 'Waiting for the printer' })
      this.after(1100, () => this.runPages())
    })
  }

  resume(): void {
    if (!this.job || !this.job.paused) return
    this.job.paused = false
    this.emitStatus('queued', { message: 'Resuming your print job' })
    this.after(900, () => this.runPages())
  }

  reset(): void {
    this.clearTimers()
    this.job = null
    this.healthState = { ready: true, paper: 'ok', message: 'Ready to print' }
  }

  /* ----- operator-only fault injection (same events a driver emits) ----- */

  injectJam(): void {
    if (this.job && !this.job.paused) {
      this.pauseJob()
      this.emitStatus('paper_jam', { message: 'Paper jam detected inside the printer' })
    }
    this.healthState = { ready: false, paper: 'ok', message: 'Paper jam — needs attention' }
  }

  injectOutOfPaper(): void {
    if (this.job && !this.job.paused) {
      this.pauseJob()
      this.emitStatus('out_of_paper', { message: 'The kiosk ran out of paper' })
    }
    this.healthState = { ready: false, paper: 'out', message: 'Out of paper' }
  }

  injectRecover(): void {
    this.healthState = { ready: true, paper: 'ok', message: 'Ready to print' }
    if (this.job?.paused) this.resume()
  }

  /* ----- internals ----- */

  private pauseJob() {
    if (!this.job) return
    this.job.paused = true
    this.clearTimers()
  }

  private runPages() {
    if (!this.job) return
    this.emitStatus('printing', { message: 'Printing' })
    const iv = setInterval(() => {
      if (!this.job) {
        clearInterval(iv)
        return
      }
      this.job.pagesDone += 1
      const done = this.job.pagesDone >= this.job.spec.pages * this.job.spec.copies
      if (done) {
        clearInterval(iv)
        this.emitStatus('completed', {
          pagesDone: this.job.pagesDone,
          pagesTotal: this.job.spec.pages * this.job.spec.copies,
          message: 'Print job completed',
        })
      } else {
        this.emitStatus('printing', {
          pagesDone: this.job.pagesDone,
          pagesTotal: this.job.spec.pages * this.job.spec.copies,
        })
      }
    }, 850)
    this.timers.push(iv)
  }

  private emitStatus(status: PrintStatus, extra: Omit<PrinterStatusEvent, 'status'> = {}) {
    this.emitter.emit('status', { status, ...extra })
  }

  private after(ms: number, fn: () => void) {
    const t = setTimeout(fn, ms)
    this.timers.push(t)
  }

  private clearTimers() {
    for (const t of this.timers) {
      clearTimeout(t as ReturnType<typeof setTimeout>)
      clearInterval(t as ReturnType<typeof setInterval>)
    }
    this.timers = []
  }
}
