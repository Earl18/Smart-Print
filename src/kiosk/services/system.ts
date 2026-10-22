import type { SystemFlags, SystemService } from './types'

/**
 * In-memory kiosk self-check: internet reachability and license activation.
 * A real implementation pings the backend and reads the license dongle.
 * Operator overrides persist for the browser session (sessionStorage) so a
 * power cycle re-detects the same condition, like real hardware would.
 */
export class InMemorySystemService implements SystemService {
  private static OFFLINE_KEY = 'smartprint.sys.offline'
  private static LICENSE_KEY = 'smartprint.sys.license'

  private flagsState: SystemFlags = {
    storageFreeGb: 42.7,
    storageTotalGb: 128,
    bluetooth: true,
    usb: true,
  }

  private readFlag(key: string): boolean {
    if (typeof window === 'undefined') return false
    try {
      return window.sessionStorage.getItem(key) === '1'
    } catch {
      return false
    }
  }

  private writeFlag(key: string, value: boolean): void {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(key, value ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  check(): { online: boolean; licenseOk: boolean } {
    const navigatorOnline = typeof navigator === 'undefined' ? true : navigator.onLine
    return {
      online: !this.readFlag(InMemorySystemService.OFFLINE_KEY) && navigatorOnline,
      licenseOk: !this.readFlag(InMemorySystemService.LICENSE_KEY),
    }
  }

  flags(): SystemFlags {
    return { ...this.flagsState }
  }

  toggleOffline(): void {
    this.writeFlag(InMemorySystemService.OFFLINE_KEY, !this.readFlag(InMemorySystemService.OFFLINE_KEY))
  }

  toggleLicense(): void {
    this.writeFlag(InMemorySystemService.LICENSE_KEY, !this.readFlag(InMemorySystemService.LICENSE_KEY))
  }

  activateLicense(): void {
    this.writeFlag(InMemorySystemService.LICENSE_KEY, false)
  }
}
