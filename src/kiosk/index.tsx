'use client'

import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { KioskProvider, useKiosk } from '@/kiosk/KioskContext'
import { TopBar } from '@/kiosk/components/TopBar'
import { DevPanel } from '@/kiosk/components/DevPanel'
import { InactivityOverlay } from '@/kiosk/overlays/InactivityOverlay'
import { BootScreen } from '@/kiosk/overlays/BootScreen'
import { SetupRequiredScreen } from '@/kiosk/overlays/SetupRequiredScreen'
import { NotReadyScreen } from '@/kiosk/overlays/NotReadyScreen'
import { RecoveryScreen } from '@/kiosk/overlays/RecoveryScreen'
import { OutageHoldScreen } from '@/kiosk/overlays/OutageHoldScreen'
import { MaintenanceOverlay } from '@/kiosk/overlays/MaintenanceOverlay'
import { WelcomeScreen } from '@/kiosk/screens/WelcomeScreen'
import { SetupWizardScreen } from '@/kiosk/screens/SetupWizardScreen'
import { KioskBrowserScreen } from '@/kiosk/screens/KioskBrowserScreen'
import { PreferencesScreen } from '@/kiosk/screens/PreferencesScreen'
import { SourceSelectScreen } from '@/kiosk/screens/SourceSelectScreen'
import { ReceivingScreen } from '@/kiosk/screens/ReceivingScreen'
import { ScanScreen } from '@/kiosk/screens/ScanScreen'
import { ReviewScreen } from '@/kiosk/screens/ReviewScreen'
import { PaymentMethodScreen } from '@/kiosk/screens/PaymentMethodScreen'
import { CashScreen } from '@/kiosk/screens/CashScreen'
import { EwalletScreen } from '@/kiosk/screens/EwalletScreen'
import { PrintingScreen } from '@/kiosk/screens/PrintingScreen'
import { SuccessScreen } from '@/kiosk/screens/SuccessScreen'
import { ReportProblemScreen } from '@/kiosk/screens/ReportProblemScreen'
import type { KioskState } from '@/kiosk/lib/types'

function screenFor(phase: KioskState['phase']) {
  switch (phase) {
    case 'BOOT':
      return <BootScreen />
    case 'FIRST_RUN_SETUP':
      return <SetupWizardScreen />
    case 'SETUP_REQUIRED':
      return <SetupRequiredScreen />
    case 'NOT_READY':
      return <NotReadyScreen />
    case 'RECOVERY_PROMPT':
      return <RecoveryScreen />
    case 'WELCOME':
      return <WelcomeScreen />
    case 'WEBSITE':
      return <KioskBrowserScreen />
    case 'PREFERENCES':
      return <PreferencesScreen />
    case 'SOURCE_SELECT':
      return <SourceSelectScreen />
    case 'RECEIVING':
      return <ReceivingScreen />
    case 'SCAN':
      return <ScanScreen />
    case 'REVIEW':
      return <ReviewScreen />
    case 'PAYMENT_METHOD':
      return <PaymentMethodScreen />
    case 'PAY_CASH':
      return <CashScreen />
    case 'PAY_EWALLET':
      return <EwalletScreen />
    case 'PRINTING':
      return <PrintingScreen />
    case 'SUCCESS':
      return <SuccessScreen />
    case 'REPORT_PROBLEM':
      return <ReportProblemScreen />
    case 'OUTAGE_HOLD':
      return <OutageHoldScreen />
    default:
      return <BootScreen />
  }
}

function KioskShell() {
  const { state } = useKiosk()
  return (
    <div className="kiosk-root flex h-[100dvh] w-full flex-col overflow-hidden">
      <TopBar />
      <main className="kb-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="min-h-full w-full"
          >
            {screenFor(state.phase)}
          </motion.div>
        </AnimatePresence>
      </main>
      <InactivityOverlay />
      <MaintenanceOverlay />
      <DevPanel />
    </div>
  )
}

export default function KioskApp() {
  return (
    <MotionConfig reducedMotion="user">
      <KioskProvider>
        <KioskShell />
      </KioskProvider>
    </MotionConfig>
  )
}
