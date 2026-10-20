import { TypedEmitter, type Unsubscribe } from '@/kiosk/lib/emitter'
import type { WalletService, WalletStatusEvent } from './types'

function walletRef(): string {
  const rand = Math.floor(Math.random() * 900000) + 100000
  return `EW-${rand}`
}

/**
 * In-memory e-wallet payment gateway. Creates a payment request and emits
 * status transitions (confirmed / failed / expired) exactly like the real
 * gateway webhook would.
 */
export class InMemoryWalletService implements WalletService {
  private emitter = new TypedEmitter<{ status: WalletStatusEvent }>()
  private pendingRef: string | null = null

  create(amount: number, orderRef: string): { reference: string; qrData: string } {
    this.pendingRef = walletRef()
    return {
      reference: this.pendingRef,
      qrData: `https://pay.smartprint.ph/w/${this.pendingRef}?amt=${amount}&ref=${orderRef}`,
    }
  }

  cancel(): void {
    this.pendingRef = null
  }

  on(event: 'status', cb: (payload: WalletStatusEvent) => void): Unsubscribe {
    return this.emitter.on(event, cb)
  }

  confirm(): void {
    if (!this.pendingRef) return
    this.pendingRef = null
    this.emitter.emit('status', { status: 'confirmed' })
  }

  fail(): void {
    if (!this.pendingRef) return
    this.pendingRef = null
    this.emitter.emit('status', { status: 'failed' })
  }

  expire(): void {
    if (!this.pendingRef) return
    this.pendingRef = null
    this.emitter.emit('status', { status: 'expired' })
  }
}
