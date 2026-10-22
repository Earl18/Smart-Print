import { TypedEmitter, type Unsubscribe } from '@/kiosk/lib/emitter'
import type { DocMeta, FileSource, UsbFile } from '@/kiosk/lib/types'
import type { FileIntakeService, IntakeFailedEvent, IntakeProgressEvent, IntakeReceivedEvent, IntakeStatusEvent } from './types'

type IntakeEvents = {
  status: IntakeStatusEvent
  progress: IntakeProgressEvent
  received: IntakeReceivedEvent
  failed: IntakeFailedEvent
}

/** Files currently on the plugged-in USB drive. */
export const USB_CATALOG: UsbFile[] = [
  { name: 'Thesis-Final.pdf', ext: 'pdf', sizeBytes: 2_431_200, kind: 'pdf' },
  { name: 'Treasurer-Report-Sept.docx', ext: 'docx', sizeBytes: 832_400, kind: 'document' },
  { name: 'Beach-Day-2025.jpg', ext: 'jpg', sizeBytes: 3_128_900, kind: 'image' },
]

function docForUsbFile(f: UsbFile): DocMeta {
  switch (f.kind) {
    case 'pdf':
      return { ...f, pages: 12, images: 2 }
    case 'document':
      return { ...f, pages: 5, images: 3 }
    default:
      return { ...f, pages: 1, images: 1 }
  }
}

/** Builds the document record for a file sent from the phone upload page. */
export function docForPhoneFile(file: { fileName: string; sizeBytes: number; fileType: string }): DocMeta {
  const ext = file.fileType || (file.fileName.includes('.') ? (file.fileName.split('.').pop() ?? 'bin').toLowerCase() : 'bin')
  const kind: DocMeta['kind'] =
    ext === 'pdf'
      ? 'pdf'
      : ['jpg', 'jpeg', 'png'].includes(ext)
        ? 'image'
        : ['doc', 'docx'].includes(ext)
          ? 'document'
          : 'unknown'
  const base = { name: file.fileName, ext, sizeBytes: file.sizeBytes, kind }
  switch (kind) {
    case 'pdf':
      return { ...base, pages: 3, images: 1 }
    case 'document':
      return { ...base, pages: 4, images: 2 }
    case 'image':
      return { ...base, pages: 1, images: 1 }
    default:
      return { ...base, pages: 1, images: 0 }
  }
}

const DEFAULT_DOCS: Record<Exclude<FileSource, 'usb'>, DocMeta> = {
  qr: { name: 'phone-upload.pdf', ext: 'pdf', sizeBytes: 1_842_000, kind: 'pdf', pages: 3, images: 2 },
  bluetooth: { name: 'Group-Project-Notes.pdf', ext: 'pdf', sizeBytes: 1_118_000, kind: 'pdf', pages: 4, images: 1 },
}

/**
 * In-memory file intake channel (QR upload, Bluetooth transfer, USB drive).
 * Emits the same event sequence as the real transports: waiting → receiving
 * (progress) → received, with timeout / error paths.
 */
export class InMemoryFileIntakeService implements FileIntakeService {
  private emitter = new TypedEmitter<IntakeEvents>()
  private source: FileSource | null = null
  private timers: Array<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>> = []

  start(source: FileSource): void {
    this.cancel()
    this.source = source
    if (source === 'usb') {
      this.emitter.emit('status', { status: 'reading', message: 'Reading the USB drive…' })
      this.after(1200, () => {
        if (this.source !== 'usb') return
        this.emitter.emit('status', {
          status: 'ready',
          message: 'Choose a file from the list below.',
          usbFiles: USB_CATALOG,
        })
      })
      return
    }
    this.emitter.emit('status', {
      status: 'waiting',
      message: source === 'qr' ? 'Waiting for your upload…' : 'Waiting for your Bluetooth transfer…',
    })
    // QR waits for the phone upload API; only Bluetooth uses the demo transfer.
    if (source === 'bluetooth') {
      this.after(2800, () => {
        if (this.source !== source) return
        this.runTransfer({ ...DEFAULT_DOCS[source] })
      })
    }
  }

  cancel(): void {
    this.clearTimers()
    this.source = null
  }

  pickUsbFile(name: string): void {
    const file = USB_CATALOG.find((f) => f.name === name)
    if (!file || this.source !== 'usb') return
    this.runTransfer(docForUsbFile(file))
  }

  on<K extends keyof IntakeEvents>(event: K, cb: (payload: IntakeEvents[K]) => void): Unsubscribe {
    return this.emitter.on(event, cb)
  }

  /* ----- operator-only triggers (same events the transports emit) ----- */

  deliverNow(partial: Partial<DocMeta> = {}): void {
    const base: DocMeta =
      this.source === 'usb'
        ? docForUsbFile(USB_CATALOG[0])
        : { ...DEFAULT_DOCS[this.source ?? 'qr'] }
    this.runTransfer({ ...base, ...partial })
  }

  deliverCorrupt(): void {
    const base: DocMeta =
      this.source === 'usb'
        ? docForUsbFile(USB_CATALOG[0])
        : { ...DEFAULT_DOCS[this.source ?? 'qr'] }
    this.runTransfer({
      ...base,
      name: 'download.dat',
      ext: 'dat',
      kind: 'unknown',
      pages: 0,
      images: 0,
      unreadableReason:
        'This file is damaged or in a format the kiosk cannot read. Try saving it as a PDF, JPG or PNG and send it again.',
    })
  }

  triggerTimeout(): void {
    this.emitter.emit('failed', { reason: 'Receiving timed out before the file finished sending.', kind: 'timeout' })
  }

  /* ----- internals ----- */

  private runTransfer(doc: DocMeta): void {
    this.clearTimers()
    this.emitter.emit('status', { status: 'receiving', message: `Receiving ${doc.name}…`, fileName: doc.name })
    let progress = 0
    const iv = setInterval(() => {
      progress = Math.min(100, progress + 6 + Math.round(Math.random() * 5))
      this.emitter.emit('progress', { progress })
      if (progress >= 100) {
        clearInterval(iv)
        this.after(400, () => {
          this.emitter.emit('received', { doc })
        })
      }
    }, 330)
    this.timers.push(iv)
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
