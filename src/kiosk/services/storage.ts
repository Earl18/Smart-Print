import type { KioskState, SavedSession } from '@/kiosk/lib/types'
import type { StorageService, StoredSession } from './types'

const KEY = 'smartprint.session.v1'

function read(): StoredSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed || typeof parsed !== 'object') return null
    return { powerLostAt: parsed.powerLostAt ?? null, session: parsed.session ?? null }
  } catch {
    return null
  }
}

function write(data: StoredSession): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* storage full or unavailable — session simply is not persisted */
  }
}

/**
 * Persists the active transaction to local storage so a power interruption
 * can be recovered on the next boot, and bookkeeps the uploaded file.
 */
export class LocalStorageService implements StorageService {
  save(state: KioskState): void {
    const prev = read()
    const session: SavedSession = {
      phase: state.phase,
      prefs: state.prefs,
      source: state.source,
      doc: state.doc,
      unreadableReason: state.unreadableReason,
      price: state.price,
      payment: state.payment,
      job: state.job,
      savedAt: Date.now(),
    }
    // The power-loss flag is kept only while the recovery prompt is showing.
    const keepFlag = state.phase === 'RECOVERY_PROMPT'
    write({ powerLostAt: keepFlag ? (prev?.powerLostAt ?? null) : null, session })
  }

  load(): StoredSession {
    return read() ?? { powerLostAt: null, session: null }
  }

  clear(): void {
    write({ powerLostAt: null, session: null })
  }

  /** Purge the uploaded document from kiosk storage. */
  deleteFile(): void {
    const data = read()
    if (data?.session) {
      write({ ...data, session: { ...data.session, doc: null } })
    }
  }

  markPowerLoss(): void {
    const data = read()
    write({ powerLostAt: Date.now(), session: data?.session ?? null })
  }
}
