import type { ColorMode, DocKind, FileSource, Phase } from './types'

export function formatPeso(n: number): string {
  const hasFraction = Math.round(n * 100) % 100 !== 0
  return (
    '₱' +
    n.toLocaleString('en-PH', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    })
  )
}

export function formatClock(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function formatCountdown(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60)
  const s = Math.max(0, sec) % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function formatTimeOfDay(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function kindLabel(kind: DocKind): string {
  switch (kind) {
    case 'pdf':
      return 'PDF document'
    case 'image':
      return 'Image'
    case 'document':
      return 'Document'
    default:
      return 'Unknown format'
  }
}

export function colorLabel(color: ColorMode): string {
  return color === 'bw' ? 'Black & White' : 'Colored'
}

export function sourceLabel(source: FileSource): string {
  switch (source) {
    case 'qr':
      return 'QR code'
    case 'bluetooth':
      return 'Bluetooth'
    case 'usb':
      return 'USB drive'
  }
}

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'PREFERENCES':
      return 'Choosing print preferences'
    case 'SOURCE_SELECT':
      return 'Choosing how to send the file'
    case 'RECEIVING':
      return 'Receiving a file'
    case 'SCAN':
      return 'Scanning the document'
    case 'REVIEW':
      return 'Reviewing the price'
    case 'PAYMENT_METHOD':
      return 'Choosing a payment method'
    case 'PAY_CASH':
      return 'Waiting for cash payment'
    case 'PAY_EWALLET':
      return 'Waiting for e-wallet payment'
    case 'PRINTING':
      return 'Printing'
    default:
      return 'Transaction in progress'
  }
}
