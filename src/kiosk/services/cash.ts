import { TypedEmitter, type Unsubscribe } from '@/kiosk/lib/emitter'
import type { CashErrorEvent, CashInsertedEvent, CashService } from './types'

/**
 * In-memory cash acceptor. A real implementation wraps the bill-validator
 * SDK; the event surface (inserted / error) stays identical.
 */
export class InMemoryCashService implements CashService {
  private emitter = new TypedEmitter<{ inserted: CashInsertedEvent; error: CashErrorEvent }>()
  private session: { due: number; total: number } | null = null

  beginSession(due: number): void {
    this.session = { due, total: 0 }
  }

  endSession(): void {
    this.session = null
  }

  onInserted(cb: (payload: CashInsertedEvent) => void): Unsubscribe {
    return this.emitter.on('inserted', cb)
  }

  onError(cb: (payload: CashErrorEvent) => void): Unsubscribe {
    return this.emitter.on('error', cb)
  }

  /** Bill accepted by the acceptor (event source: validator hardware). */
  accept(amount: number): void {
    if (!this.session) return
    this.session.total += amount
    this.emitter.emit('inserted', { amount, total: this.session.total })
  }

  /** Acceptor fault (jam, rejected note stack, …). */
  raiseError(message: string): void {
    if (!this.session) return
    this.emitter.emit('error', { message })
  }
}
