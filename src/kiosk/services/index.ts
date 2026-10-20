import { InMemoryCashService } from './cash'
import { InMemoryFileIntakeService } from './intake'
import { InMemoryPrinterService } from './printer'
import {
  InMemoryDeviceCheckService,
  InMemoryNetworkSetupService,
  LocalKioskConfigService,
} from './provisioning'
import { LocalStorageService } from './storage'
import { InMemorySystemService } from './system'
import { InMemoryWalletService } from './wallet'

export const printerService = new InMemoryPrinterService()
export const cashService = new InMemoryCashService()
export const walletService = new InMemoryWalletService()
export const intakeService = new InMemoryFileIntakeService()
export const storageService = new LocalStorageService()
export const systemService = new InMemorySystemService()
export const kioskConfigService = new LocalKioskConfigService()
export const networkSetupService = new InMemoryNetworkSetupService()
export const deviceCheckService = new InMemoryDeviceCheckService(printerService, cashService, systemService)

export * from './types'
export { DEFAULT_WEBSITE_URL, VALID_LICENSE_KEY, BUNDLED_SETTINGS } from './provisioning'
