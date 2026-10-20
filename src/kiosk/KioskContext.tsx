'use client'

import { createContext, type Dispatch, useContext, type ReactNode } from 'react'
import type { KioskEvent, KioskState } from '@/kiosk/lib/types'
import { useKioskMachine } from '@/kiosk/lib/useKioskMachine'

export interface KioskApi {
  state: KioskState
  dispatch: Dispatch<KioskEvent>
}

const KioskContext = createContext<KioskApi | null>(null)

export function KioskProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useKioskMachine()
  return <KioskContext.Provider value={{ state, dispatch }}>{children}</KioskContext.Provider>
}

export function useKiosk(): KioskApi {
  const ctx = useContext(KioskContext)
  if (!ctx) throw new Error('useKiosk must be used inside <KioskProvider>')
  return ctx
}
