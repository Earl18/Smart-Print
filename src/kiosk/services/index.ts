import { InMemoryCashService } from './cash'
import { InMemoryFileIntakeService } from './intake'
import { InMemoryPrinterService } from './printer'
import { LocalStorageService } from './storage'
import { InMemorySystemService } from './system'
import { InMemoryWalletService } from './wallet'

export const printerService = new InMemoryPrinterService()
export const cashService = new InMemoryCashService()
export const walletService = new InMemoryWalletService()
export const intakeService = new InMemoryFileIntakeService()
export const storageService = new LocalStorageService()
export const systemService = new InMemorySystemService()

export * from './types'
