'use client'

import {
  BatteryWarning,
  Check,
  FileDown,
  FileX2,
  Fuel,
  LaptopMinimal,
  Power,
  RotateCcw,
  Wallet,
  X,
} from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { cashService, intakeService, printerService, storageService, systemService, walletService } from '@/kiosk/services'
import { CASH_DENOMINATIONS } from '@/kiosk/services'

/**
 * Operator panel — hidden from the customer UI. Opens only with
 * Ctrl+Shift+F9 and fires the exact events the hardware services emit
 * (bill accepted, wallet confirmed, printer jam, power cut, …).
 */
export function DevPanel() {
  const { state, dispatch } = useKiosk()
  if (!state.devPanelOpen) return null

  const inCash = state.phase === 'PAY_CASH' && state.payment.status === 'awaiting'
  const inWallet = state.phase === 'PAY_EWALLET' && state.payment.status === 'awaiting'
  const inPrinting = state.phase === 'PRINTING' && (state.job.status === 'printing' || state.job.status === 'queued')
  const inReceiving = state.phase === 'RECEIVING'

  const cutPower = () => {
    storageService.markPowerLoss()
    setTimeout(() => window.location.reload(), 200)
  }

  return (
    <section
      aria-label="Service panel"
      className="kb-card-flat fixed bottom-3 left-3 z-[90] w-[320px] max-w-[calc(100vw-24px)] p-3 shadow-[7px_7px_0_#000]"
    >
      <div className="mb-2 flex justify-end">
        <button type="button" className="kb-mini" onClick={() => dispatch({ type: 'DEV_CLOSE' })} aria-label="Close service panel">
          <X className="size-3.5" aria-hidden /> Esc
        </button>
      </div>

      <PanelGroup label="Cash acceptor">
        {CASH_DENOMINATIONS.map((d) => (
          <button key={d} type="button" className="kb-mini" disabled={!inCash} onClick={() => cashService.accept(d)}>
            ₱{d}
          </button>
        ))}
        <button type="button" className="kb-mini" disabled={!inCash} onClick={() => cashService.raiseError('Acceptor fault — bills returned')}>
          <BatteryWarning className="size-3.5" aria-hidden /> Fault
        </button>
      </PanelGroup>

      <PanelGroup label="E-wallet gateway">
        <button type="button" className="kb-mini" disabled={!inWallet} onClick={() => walletService.confirm()}>
          <Check className="size-3.5" aria-hidden /> Confirm
        </button>
        <button type="button" className="kb-mini" disabled={!inWallet} onClick={() => walletService.fail()}>
          Fail
        </button>
        <button type="button" className="kb-mini" disabled={!inWallet} onClick={() => walletService.expire()}>
          Expire
        </button>
      </PanelGroup>

      <PanelGroup label="Printer">
        <button type="button" className="kb-mini" onClick={() => printerService.injectJam()}>
          Jam
        </button>
        <button type="button" className="kb-mini" onClick={() => printerService.injectOutOfPaper()}>
          <Fuel className="size-3.5" aria-hidden /> No paper
        </button>
        <button type="button" className="kb-mini" onClick={() => printerService.injectRecover()}>
          <RotateCcw className="size-3.5" aria-hidden /> Fix
        </button>
      </PanelGroup>

      <PanelGroup label="File intake">
        <button type="button" className="kb-mini" disabled={!inReceiving} onClick={() => intakeService.deliverNow()}>
          <FileDown className="size-3.5" aria-hidden /> Send file
        </button>
        <button type="button" className="kb-mini" disabled={!inReceiving} onClick={() => intakeService.deliverCorrupt()}>
          <FileX2 className="size-3.5" aria-hidden /> Unreadable
        </button>
        <button type="button" className="kb-mini" disabled={!inReceiving} onClick={() => intakeService.triggerTimeout()}>
          Timeout
        </button>
      </PanelGroup>

      <PanelGroup label="Kiosk system">
        <button type="button" className="kb-mini" onClick={() => systemService.toggleOffline()}>
          <LaptopMinimal className="size-3.5" aria-hidden /> Net {state.online ? 'off' : 'on'}
        </button>
        <button type="button" className="kb-mini" onClick={() => systemService.toggleLicense()}>
          License
        </button>
        <button type="button" className="kb-mini" onClick={() => dispatch({ type: 'RESET' })}>
          <RotateCcw className="size-3.5" aria-hidden /> Reset
        </button>
      </PanelGroup>

      <PanelGroup label="Session">
        <button type="button" className="kb-mini" onClick={cutPower}>
          <Power className="size-3.5" aria-hidden /> Cut power
        </button>
        <button type="button" className="kb-mini" onClick={() => storageService.clear()}>
          Clear saved
        </button>
        <button type="button" className="kb-mini" onClick={() => dispatch({ type: 'TOGGLE_DEV' })}>
          <Wallet className="size-3.5" aria-hidden /> Hide
        </button>
      </PanelGroup>
    </section>
  )
}

function PanelGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black/50">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
