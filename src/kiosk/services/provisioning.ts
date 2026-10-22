import type {
  DeviceStatus,
  KioskConfig,
  OperatorSettings,
  SetupProgress,
  WifiNetwork,
} from '@/kiosk/lib/types'
import type {
  CashService,
  ConnectStage,
  ConnectStageState,
  DeviceCheckService,
  KioskConfigService,
  LicenseValidation,
  NetworkSetupService,
  PrinterService,
  PublishedSettings,
  SystemService,
} from './types'
import { kiosks, licenses } from '@/lib/data/db'

/* ============================================================
   KioskConfigService — configuration, setup progress and the
   maintenance PIN, persisted to local storage.
   ============================================================ */

const CONFIG_KEY = 'smartprint.config.v1'
const SETUP_KEY = 'smartprint.setup.v1'
const MAINT_KEY = 'smartprint.maintenance.v1'

function scopedKey(key: string, kioskId?: string): string {
  if (typeof window === 'undefined') return key
  const id = kioskId ?? new URLSearchParams(window.location.search).get('kioskId')
  return id ? `${key}.${encodeURIComponent(id)}` : key
}

const PIN_MAX_ATTEMPTS = 5
const PIN_LOCK_SECONDS = 60

export const DEFAULT_WEBSITE_URL = 'https://smartprint.example'
export const VALID_LICENSE_KEY = '4F2A-9C1D-77B3-E5A0'

export const BUNDLED_SETTINGS: OperatorSettings = {
  prices: {
    A4: { bw: 5, color: 10 },
    Letter: { bw: 5, color: 10 },
    A3: { bw: 10, color: 15 },
  },
  copyLimit: { min: 1, max: 10 },
  allowedInputs: ['qr', 'bluetooth', 'usb'],
  paymentMethods: ['cash', 'ewallet'],
  timers: { upload: { qr: 180, bluetooth: 180, usb: 90 }, cash: 120, wallet: 180 },
}

interface MaintRecord {
  attempts: number
  lockedUntil: number
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable — configuration simply is not persisted */
  }
}

function removeKey(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export class LocalKioskConfigService implements KioskConfigService {
  load(): KioskConfig | null {
    const cfg = readJson<KioskConfig>(scopedKey(CONFIG_KEY))
    if (!cfg || typeof cfg !== 'object' || !cfg.license) return null
    return cfg
  }

  save(config: KioskConfig): void {
    writeJson(scopedKey(CONFIG_KEY), config)
  }

  resetKiosk(kioskId?: string): void {
    removeKey(scopedKey(CONFIG_KEY, kioskId))
    removeKey(scopedKey(SETUP_KEY, kioskId))
    removeKey(scopedKey(MAINT_KEY, kioskId))
  }

  loadSetupProgress(): SetupProgress | null {
    return readJson<SetupProgress>(scopedKey(SETUP_KEY))
  }

  saveSetupProgress(progress: SetupProgress): void {
    writeJson(scopedKey(SETUP_KEY), progress)
  }

  clearSetupProgress(): void {
    removeKey(scopedKey(SETUP_KEY))
  }

  verifyOperatorPin(pin: string): { ok: boolean; lockedFor: number } {
    const record = readJson<MaintRecord>(scopedKey(MAINT_KEY)) ?? { attempts: 0, lockedUntil: 0 }
    const now = Date.now()
    if (record.lockedUntil > now) {
      return { ok: false, lockedFor: Math.ceil((record.lockedUntil - now) / 1000) }
    }
    const cfg = this.load()
    const expected = cfg?.operatorPin ?? '000000'
    if (pin === expected) {
      removeKey(scopedKey(MAINT_KEY))
      return { ok: true, lockedFor: 0 }
    }
    const attempts = record.attempts + 1
    if (attempts >= PIN_MAX_ATTEMPTS) {
      const lockedUntil = now + PIN_LOCK_SECONDS * 1000
      writeJson(scopedKey(MAINT_KEY), { attempts: 0, lockedUntil })
      return { ok: false, lockedFor: PIN_LOCK_SECONDS }
    }
    writeJson(scopedKey(MAINT_KEY), { attempts, lockedUntil: 0 })
    return { ok: false, lockedFor: 0 }
  }

  pinLockRemaining(): number {
    const record = readJson<MaintRecord>(scopedKey(MAINT_KEY))
    if (!record || record.lockedUntil <= Date.now()) return 0
    return Math.ceil((record.lockedUntil - Date.now()) / 1000)
  }

  setWebsiteUrl(url: string): void {
    const cfg = this.load()
    if (!cfg) return
    this.save({ ...cfg, websiteUrl: url })
  }
}

/* ============================================================
   NetworkSetupService — Wi-Fi scan/connect, license activation
   and the operator's published settings.
   ============================================================ */

interface ScanSeed {
  ssid: string
  signal: WifiNetwork['signal']
  security: WifiNetwork['security']
}

const WIFI_SEEDS: ScanSeed[] = [
  { ssid: 'SmartPrint-HQ', signal: 4, security: 'WPA2' },
  { ssid: 'Café_Guest', signal: 4, security: 'Open' },
  { ssid: 'PLDT_Fibr_5G', signal: 3, security: 'WPA2/WPA3' },
  { ssid: 'HP-Print-42-LaserJet', signal: 2, security: 'WPA2' },
  { ssid: 'Neighbor_2.4G', signal: 1, security: 'WPA2' },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function licenseKeyShape(key: string): boolean {
  return /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(key)
}

export class InMemoryNetworkSetupService implements NetworkSetupService {
  async scanWifi(): Promise<WifiNetwork[]> {
    await delay(1100)
    return WIFI_SEEDS.map((seed) => ({
      ...seed,
      // Signal strength wobbles slightly between scans, like a real adapter.
      signal: Math.max(1, Math.min(4, seed.signal + (Math.random() < 0.25 ? -1 : 0))) as WifiNetwork['signal'],
    }))
  }

  async connectWifi(
    ssid: string,
    password: string,
    onStage: (stage: ConnectStage, state: ConnectStageState, message?: string) => void,
  ): Promise<{ ok: boolean; message: string | null }> {
    onStage('wifi', 'active', `Connecting to ${ssid}…`)
    await delay(1100)
    if (password.trim().length < 8) {
      onStage('wifi', 'failed', 'The network did not accept the password')
      return { ok: false, message: 'The Wi-Fi password was not accepted. Check it and try again.' }
    }
    onStage('wifi', 'ok', `Connected to ${ssid}`)
    onStage('internet', 'active', 'Checking internet access…')
    await delay(900)
    onStage('internet', 'ok', 'Internet is reachable')
    onStage('service', 'active', 'Reaching the Smart Print service…')
    await delay(700)
    onStage('service', 'ok', 'Smart Print service is reachable')
    return { ok: true, message: null }
  }

  async validateLicense(key: string): Promise<LicenseValidation> {
    await delay(1400)
    const normalized = key.trim().toUpperCase()
    if (!licenseKeyShape(normalized)) return { status: 'invalid' }
    const selectedId = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('kioskId')
    if (selectedId) {
      const kiosk = kiosks.find((item) => item.id === selectedId)
      const license = licenses.find((item) => item.key === normalized && item.kioskId === selectedId)
      if (!kiosk || !license) return { status: 'invalid' }
      if (license.status === 'expired') return { status: 'expired' }
      return { status: 'valid', operatorName: license.issuedTo, kioskName: kiosk.name }
    }
    if (normalized === VALID_LICENSE_KEY) {
      return { status: 'valid', operatorName: 'BrightCopy Internet Café', kioskName: 'Smart Print SM-101' }
    }
    if (normalized.endsWith('-0000')) return { status: 'expired' }
    if (normalized.endsWith('-1111')) return { status: 'in_use' }
    return { status: 'invalid' }
  }

  async fetchPublishedSettings(mode: 'online' | 'offline'): Promise<PublishedSettings> {
    if (mode === 'offline') {
      await delay(500)
      return { version: 3, settings: BUNDLED_SETTINGS, source: 'bundled' }
    }
    await delay(1200)
    return { version: 7, settings: BUNDLED_SETTINGS, source: 'remote' }
  }
}

/* ============================================================
   DeviceCheckService — aggregates the hardware self-checks
   ============================================================ */

export class InMemoryDeviceCheckService implements DeviceCheckService {
  constructor(
    private printerService: PrinterService,
    private cashService: CashService,
    private systemService: SystemService,
  ) {}

  async runChecks(): Promise<DeviceStatus[]> {
    const printer = await this.printerService.health()
    const cash = this.cashService.check()
    const flags = this.systemService.flags()

    const paperState: DeviceStatus['state'] =
      printer.paper === 'ok' ? 'ok' : printer.paper === 'low' ? 'warn' : 'fail'

    const storageState: DeviceStatus['state'] =
      flags.storageFreeGb >= 5 ? 'ok' : flags.storageFreeGb >= 1 ? 'warn' : 'fail'

    return [
      {
        id: 'printer',
        state: printer.ready ? 'ok' : 'fail',
        blocking: true,
        detail: printer.ready ? 'Printer detected and responding' : printer.message,
      },
      {
        id: 'paper',
        state: paperState,
        blocking: printer.paper === 'out',
        detail:
          printer.paper === 'ok'
            ? 'Paper tray loaded'
            : printer.paper === 'low'
              ? 'Paper is running low — reload soon'
              : 'No paper in the tray',
      },
      {
        id: 'cash',
        state: cash.ready ? 'ok' : 'fail',
        blocking: true,
        detail: cash.message,
      },
      {
        id: 'storage',
        state: storageState,
        blocking: flags.storageFreeGb < 1,
        detail: `${flags.storageFreeGb.toFixed(1)} GB free of ${flags.storageTotalGb} GB`,
      },
      {
        id: 'bluetooth',
        state: flags.bluetooth ? 'ok' : 'warn',
        blocking: false,
        detail: flags.bluetooth
          ? 'Bluetooth adapter ready'
          : 'No Bluetooth adapter — customers can still use QR and USB',
      },
      {
        id: 'usb',
        state: flags.usb ? 'ok' : 'warn',
        blocking: false,
        detail: flags.usb
          ? 'USB port ready'
          : 'No USB port detected — customers can still use QR and Bluetooth',
      },
    ]
  }
}
