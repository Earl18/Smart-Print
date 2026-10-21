'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bluetooth,
  Check,
  CheckCircle2,
  ChevronLeft,
  CloudDownload,
  Files,
  HardDrive,
  Info,
  KeySquare,
  Loader2,
  LockKeyhole,
  Printer,
  QrCode,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  Usb,
  Wifi,
  WifiHigh,
  WifiLow,
  WifiOff,
  XCircle,
} from 'lucide-react'
import { useKiosk } from '@/kiosk/KioskContext'
import { KioskLogo } from '@/kiosk/components/Logo'
import {
  KButton,
  KCard,
  KeyVal,
  Money,
  Notice,
  SectionHeading,
  StatusPill,
} from '@/kiosk/components/primitives'
import {
  DEFAULT_WEBSITE_URL,
  VALID_LICENSE_KEY,
  deviceCheckService,
  kioskConfigService,
  networkSetupService,
} from '@/kiosk/services'
import type { KioskConfig, SetupProgress, WifiNetwork } from '@/kiosk/lib/types'
import type { ConnectStage, ConnectStageState, PublishedSettings as Published } from '@/kiosk/services'
import { cn } from '@/lib/utils'

/* ============================================================
   First-time setup wizard. One-time provisioning replaces the
   Welcome screen until it is completed: network mode, license,
   device check, operator settings and the maintenance PIN.
   Progress is persisted so a power loss resumes on the same step.
   ============================================================ */
const STEPS = ['Welcome', 'Network', 'License', 'Devices', 'Settings', 'Finish'] as const

interface Draft {
  mode: 'online' | 'offline' | null
  wifiSsid: string | null
  licenseKey: string | null
  licenseInfo: { operatorName: string; kioskName: string } | null
  pin: string
}

function loadDraft(progress: SetupProgress | null): Draft {
  return {
    mode: progress?.mode ?? null,
    wifiSsid: progress?.wifiSsid ?? null,
    licenseKey: progress?.licenseKey ?? null,
    licenseInfo: progress?.licenseInfo ?? null,
    pin: progress?.pin ?? '000000',
  }
}

export function SetupWizardScreen() {
  const { dispatch } = useKiosk()
  const [initial] = useState(() => kioskConfigService.loadSetupProgress())
  const [step, setStep] = useState(initial?.step && initial.step >= 1 && initial.step <= 6 ? initial.step : 1)
  const [draft, setDraft] = useState<Draft>(() => loadDraft(initial))
  const [flash, setFlash] = useState<string | null>(null)
  const [devicesCleared, setDevicesCleared] = useState<boolean | null>(null)
  const [devicesRunning, setDevicesRunning] = useState(false)
  const [published, setPublished] = useState<Published | null>(null)

  const patch = useCallback((part: Partial<Draft>) => setDraft((d) => ({ ...d, ...part })), [])

  /* Persist wizard progress after every change (power-loss resume). */
  useEffect(() => {
    kioskConfigService.saveSetupProgress({
      step,
      mode: draft.mode,
      wifiSsid: draft.wifiSsid,
      licenseKey: draft.licenseKey,
      licenseInfo: draft.licenseInfo,
      pin: draft.pin || null,
    })
  }, [step, draft])

  const canContinue = (s: number): boolean => {
    switch (s) {
      case 1:
        return true
      case 2:
        return draft.mode === 'offline' || (draft.mode === 'online' && draft.wifiSsid !== null)
      case 3:
        return draft.licenseInfo !== null
      case 4:
        return devicesCleared === true && !devicesRunning
      case 5:
        return published !== null && /^\d{6}$/.test(draft.pin)
      default:
        return true
    }
  }

  const complete = () => {
    if (!draft.licenseInfo || !published) return
    const cfg: KioskConfig = {
      mode: draft.mode ?? 'online',
      wifiSsid: draft.wifiSsid,
      license: {
        key: draft.licenseKey ?? VALID_LICENSE_KEY,
        operatorName: draft.licenseInfo.operatorName,
        kioskName: draft.licenseInfo.kioskName,
      },
      operatorPin: /^\d{6}$/.test(draft.pin) ? draft.pin : '000000',
      settings: published.settings,
      settingsVersion: published.version,
      websiteUrl: kioskConfigService.load()?.websiteUrl ?? DEFAULT_WEBSITE_URL,
      completedAt: Date.now(),
    }
    kioskConfigService.save(cfg)
    kioskConfigService.clearSetupProgress()
    dispatch({ type: 'SETUP_COMPLETE' })
  }

  const primaryLabel: Record<number, string> = {
    1: 'Begin setup',
    2: 'Continue',
    3: 'Continue',
    4: 'Continue',
    5: 'Continue',
    6: 'Start kiosk',
  }

  const goNext = () => {
    if (!canContinue(step)) return
    if (step === 6) {
      complete()
      return
    }
    setFlash(null)
    setStep(step + 1)
  }

  const goBack = () => {
    if (step <= 1) return
    setFlash(null)
    setStep(step - 1)
  }

  const cancel = () => {
    setFlash('Setup paused — your progress is saved and the kiosk stays closed to customers.')
    setStep(1)
  }

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-5">
        <StepDots current={step} />
        <SectionHeading sub={SUBTITLES[step]}>
          {step === 1 ? 'Set up your Smart Print kiosk' : STEP_TITLES[step]}
        </SectionHeading>
      </div>

      {flash ? <Notice icon={Info}>{flash}</Notice> : null}

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {step === 1 ? <StepWelcome /> : null}
        {step === 2 ? <StepNetwork draft={draft} patch={patch} /> : null}
        {step === 3 ? <StepLicense draft={draft} patch={patch} /> : null}
        {step === 4 ? (
          <StepDevices
            onStatus={(running, cleared) => {
              setDevicesRunning(running)
              setDevicesCleared(cleared)
            }}
          />
        ) : null}
        {step === 5 ? <StepConfig draft={draft} patch={patch} onLoaded={setPublished} published={published} /> : null}
        {step === 6 ? <StepFinish draft={draft} published={published} /> : null}
      </motion.div>

      {/* Footer navigation — Back and Cancel on every step except the first */}
      <div className="flex flex-wrap items-center gap-3 border-t-[3px] border-black pt-5">
        {step > 1 ? (
          <>
            <KButton tone="white" icon={ChevronLeft} onClick={goBack}>
              Back
            </KButton>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex min-h-16 items-center gap-2 px-2 font-display text-base font-bold underline decoration-[3px] underline-offset-4 hover:bg-kcoral/30 focus-visible:outline-[3px]"
            >
              <XCircle className="size-5" strokeWidth={2.5} aria-hidden />
              Cancel setup
            </button>
          </>
        ) : null}
        <div className="ml-auto">
          <KButton
            size="lg"
            icon={step === 6 ? CheckCircle2 : ArrowRight}
            disabled={!canContinue(step)}
            onClick={goNext}
          >
            {primaryLabel[step]}
          </KButton>
        </div>
      </div>
    </div>
  )
}

const SUBTITLES: Record<number, string> = {
  1: 'This one-time setup prepares the kiosk for customers. It takes about two minutes.',
  2: 'Choose how this kiosk connects, so uploads and payments work as intended.',
  3: 'Activate the license that came with this kiosk.',
  4: 'Make sure every device the kiosk depends on is working.',
  5: 'Review the settings published by your operator and choose a maintenance PIN.',
  6: 'Everything is ready. Open the kiosk to customers.',
}

const STEP_TITLES: Record<number, string> = {
  2: 'Network',
  3: 'License',
  4: 'Device check',
  5: 'Configuration',
  6: 'Finish',
}

/* ---------- step progress indicator ---------- */

function StepDots({ current }: { current: number }) {
  return (
    <ol aria-label="Setup progress" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 ? <span aria-hidden className="h-[3px] w-3 bg-black sm:w-5" /> : null}
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex size-9 items-center justify-center rounded-xl border-[3px] border-black font-display text-sm font-bold sm:size-10',
                done && 'kb-lime',
                active && 'bg-black text-white',
                !done && !active && 'bg-white',
              )}
            >
              {done ? <Check className="size-5" strokeWidth={3} aria-hidden /> : n}
            </span>
            <span className={cn('hidden font-display text-sm font-bold lg:inline', !active && 'text-black/45')}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

/* ============================================================
   Step 1 — Welcome
   ============================================================ */

function StepWelcome() {
  const items = [
    { icon: Wifi, text: 'Internet access — or choose offline mode in the next step' },
    { icon: KeySquare, text: 'The license key printed on the license card' },
    { icon: Printer, text: 'The printer switched on, with paper loaded' },
    { icon: Banknote, text: 'The cash acceptor connected and powered' },
  ] as const

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <KCard>
        <h3 className="font-display text-xl font-bold">Before you start, check that you have:</h3>
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.text} className="flex items-center gap-4">
              <span className="kb-cream flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
                <item.icon className="size-6" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-[15px] font-semibold">{item.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm font-medium text-black/60">
          Customers cannot use the kiosk until setup is finished. Your progress is saved at every step,
          so a power interruption will not lose your work.
        </p>
      </KCard>
      <div className="flex flex-col items-center justify-center gap-4">
        <KioskLogo alt="" className="size-28 sm:size-36" />
        <StatusPill tone="info" icon={LockKeyhole}>
          Operator setup — customers cannot see this
        </StatusPill>
      </div>
    </div>
  )
}

/* ============================================================
   Step 2 — Network
   ============================================================ */

function StepNetwork({
  draft,
  patch,
}: {
  draft: Draft
  patch: (part: Partial<Draft>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Mode choice */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          icon={Wifi}
          title="Online"
          description="QR upload, e-wallet payments and the kiosk website. Needs a Wi-Fi network with internet."
          active={draft.mode === 'online'}
          onClick={() => {
            patch({ mode: 'online', wifiSsid: null })
          }}
        />
        <ModeCard
          icon={WifiOff}
          title="Offline"
          description="Bluetooth and USB uploads with cash payments only. For kiosks without internet."
          active={draft.mode === 'offline'}
          onClick={() => {
            patch({ mode: 'offline', wifiSsid: null })
          }}
        />
      </div>

      {draft.mode === 'offline' ? (
        <KCard tone="cream">
          <h3 className="font-display text-lg font-bold">Offline mode</h3>
          <ul className="mt-4 space-y-2.5 text-[15px] font-semibold">
            <li className="flex items-center gap-3">
              <XCircle className="size-5 shrink-0 text-kcoral" strokeWidth={2.5} aria-hidden />
              QR code upload is unavailable
            </li>
            <li className="flex items-center gap-3">
              <XCircle className="size-5 shrink-0 text-kcoral" strokeWidth={2.5} aria-hidden />
              E-wallet payments are unavailable — cash only
            </li>
            <li className="flex items-center gap-3">
              <XCircle className="size-5 shrink-0 text-kcoral" strokeWidth={2.5} aria-hidden />
              The Smart Print website button is hidden
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              Bluetooth and USB uploads keep working
            </li>
          </ul>
        </KCard>
      ) : null}

      {draft.mode === 'online' ? <WifiPanel draft={draft} patch={patch} /> : null}
    </div>
  )
}

function ModeCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: typeof Wifi
  title: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'kb-chip min-h-[150px]! flex-col! items-start! gap-2! p-5! text-left!',
        active && 'kb-chip-active',
      )}
    >
      <span className="flex items-center gap-3">
        <Icon className="size-7 shrink-0" strokeWidth={2.5} aria-hidden />
        <span className="font-display text-xl font-bold">{title}</span>
        {active ? <Check className="ml-auto size-6" strokeWidth={3} aria-hidden /> : null}
      </span>
      <span className="text-sm font-semibold leading-snug opacity-80">{description}</span>
    </button>
  )
}

function signalIcon(signal: WifiNetwork['signal']) {
  if (signal >= 3) return WifiHigh
  if (signal === 2) return WifiLow
  return WifiLow
}

function signalWord(signal: WifiNetwork['signal']) {
  return signal >= 3 ? 'Strong' : signal === 2 ? 'Good' : 'Weak'
}

const STAGE_LABELS: Record<ConnectStage, string> = {
  wifi: 'Wi-Fi connection',
  internet: 'Internet access',
  service: 'Smart Print service',
}

function WifiPanel({
  draft,
  patch,
}: {
  draft: Draft
  patch: (part: Partial<Draft>) => void
}) {
  const [networks, setNetworks] = useState<WifiNetwork[] | null>(null)
  const [scanning, setScanning] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [stages, setStages] = useState<Partial<Record<ConnectStage, { state: ConnectStageState; message?: string }>>>({})
  const [connecting, setConnecting] = useState(false)
  const [failMessage, setFailMessage] = useState<string | null>(null)
  const scanOnce = useRef(false)

  const scan = useCallback(async () => {
    setScanning(true)
    try {
      const list = await networkSetupService.scanWifi()
      setNetworks(list)
    } finally {
      setScanning(false)
    }
  }, [])

  useEffect(() => {
    if (scanOnce.current) return
    scanOnce.current = true
    void scan()
  }, [scan])

  const connect = async (ssid: string) => {
    setConnecting(true)
    setFailMessage(null)
    setStages({ wifi: { state: 'active', message: `Connecting to ${ssid}…` } })
    const res = await networkSetupService.connectWifi(ssid, password, (stage, state, message) => {
      setStages((prev) => ({ ...prev, [stage]: { state, message } }))
    })
    setConnecting(false)
    if (res.ok) {
      patch({ wifiSsid: ssid })
    } else {
      setFailMessage(res.message)
      patch({ wifiSsid: null })
    }
  }

  const connectedSsid = draft.wifiSsid

  return (
    <div className="flex flex-col gap-5">
      {/* Network list */}
      <KCard>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">Wi-Fi networks</h3>
          <KButton tone="white" size="md" icon={RefreshCcw} onClick={() => void scan()} disabled={scanning || connecting}>
            Rescan
          </KButton>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {scanning || networks === null ? (
            <div className="flex min-h-24 items-center gap-3 text-[15px] font-semibold text-black/70">
              <Loader2 className="size-6 animate-spin" strokeWidth={2.5} aria-hidden />
              Scanning for networks…
            </div>
          ) : networks.length === 0 ? (
            <p className="text-[15px] font-semibold text-black/70">No networks found. Try Rescan.</p>
          ) : (
            networks.map((net) => {
              const SignalIcon = signalIcon(net.signal)
              const isSel = selected === net.ssid
              return (
                <button
                  key={net.ssid}
                  type="button"
                  disabled={connecting}
                  onClick={() => {
                    setSelected(net.ssid)
                    setPassword('')
                    setStages({})
                    setFailMessage(null)
                    patch({ wifiSsid: null })
                  }}
                  aria-pressed={isSel}
                  className={cn('kb-chip w-full justify-between! gap-3!', isSel && 'kb-chip-active')}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <WifiHigh className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-base font-bold">{net.ssid}</span>
                      <span className="block text-xs font-bold uppercase tracking-wide opacity-70">{net.security}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-sm font-bold">
                    <SignalIcon className="size-5" strokeWidth={2.5} aria-hidden />
                    {signalWord(net.signal)}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </KCard>

      {/* Password + connect */}
      {selected ? (
        <KCard>
          <h3 className="font-display text-lg font-bold">
            Password for <span className="underline decoration-[3px] underline-offset-4">{selected}</span>
          </h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={connecting || connectedSsid === selected}
            aria-label={`Password for ${selected}`}
            placeholder="Wi-Fi password"
            className="kb-input mt-4 font-body"
            autoComplete="off"
          />
          <p className="mt-2 text-sm font-medium text-black/60">
            Networks here use passwords of at least 8 characters.
          </p>

          {connectedSsid === selected ? (
            <div className="mt-4">
              <StatusPill tone="ok" icon={CheckCircle2}>
                Connected to {selected}
              </StatusPill>
            </div>
          ) : (
            <KButton
              tone="blue"
              icon={Wifi}
              className="mt-4"
              disabled={connecting || password.trim().length === 0}
              onClick={() => void connect(selected)}
            >
              Connect
            </KButton>
          )}

          {/* Connecting stages */}
          {Object.keys(stages).length > 0 ? (
            <ol className="mt-5 space-y-2.5" aria-label="Connection progress">
              {(['wifi', 'internet', 'service'] as ConnectStage[]).map((stage) => {
                const st = stages[stage]
                if (!st) return null
                return (
                  <li key={stage} className="flex items-center gap-3">
                    {st.state === 'active' ? (
                      <Loader2 className="size-5 shrink-0 animate-spin text-kblue" strokeWidth={2.5} aria-hidden />
                    ) : st.state === 'ok' ? (
                      <CheckCircle2 className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <XCircle className="size-5 shrink-0 text-kcoral" strokeWidth={2.5} aria-hidden />
                    )}
                    <span className="text-[15px] font-bold">{STAGE_LABELS[stage]}</span>
                    <span className="truncate text-sm font-medium text-black/60">{st.message}</span>
                  </li>
                )
              })}
            </ol>
          ) : null}

          {failMessage ? (
            <div className="kb-card-flat kb-coral mt-5 p-4">
              <div className="flex items-start gap-3">
                <TriangleAlert className="size-6 shrink-0" strokeWidth={2.5} aria-hidden />
                <div>
                  <p className="font-display font-bold">Could not connect</p>
                  <p className="mt-1 text-sm font-semibold">{failMessage}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <KButton tone="white" size="md" icon={RotateCcw} onClick={() => void connect(selected)}>
                  Retry
                </KButton>
                <KButton
                  tone="white"
                  size="md"
                  icon={RefreshCcw}
                  onClick={() => {
                    setSelected(null)
                    setStages({})
                    setFailMessage(null)
                    patch({ wifiSsid: null })
                  }}
                >
                  Choose another network
                </KButton>
              </div>
            </div>
          ) : null}
        </KCard>
      ) : null}
    </div>
  )
}

/* ============================================================
   Step 3 — License
   ============================================================ */

function formatLicenseKey(raw: string): string {
  const chars = raw.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 16)
  return (chars.match(/.{1,4}/g) ?? []).join('-')
}

function StepLicense({
  draft,
  patch,
}: {
  draft: Draft
  patch: (part: Partial<Draft>) => void
}) {
  const [value, setValue] = useState(draft.licenseKey ?? '')
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'expired' | 'in_use'>(
    draft.licenseInfo ? 'valid' : 'idle',
  )

  const runValidation = useCallback(
    async (key: string) => {
      if (formatLicenseKey(key).length !== 19) return
      setStatus('checking')
      const res = await networkSetupService.validateLicense(formatLicenseKey(key))
      if (res.status === 'valid' && res.operatorName && res.kioskName) {
        patch({ licenseKey: formatLicenseKey(key), licenseInfo: { operatorName: res.operatorName, kioskName: res.kioskName } })
      } else {
        patch({ licenseKey: formatLicenseKey(key), licenseInfo: null })
      }
      setStatus(res.status)
    },
    [patch],
  )

  /* Operator-panel helper: fills and validates a license key. */
  useEffect(() => {
    const onFill = (e: Event) => {
      const key = (e as CustomEvent<string>).detail
      if (typeof key !== 'string') return
      const formatted = formatLicenseKey(key)
      setValue(formatted)
      void runValidation(formatted)
    }
    window.addEventListener('smartprint:fill-license', onFill)
    return () => window.removeEventListener('smartprint:fill-license', onFill)
  }, [runValidation])

  return (
    <div className="flex flex-col gap-5">
      <KCard>
        <label htmlFor="license-key" className="font-display text-lg font-bold">
          License key
        </label>
        <input
          id="license-key"
          value={value}
          onChange={(e) => {
            setValue(formatLicenseKey(e.target.value))
            if (status !== 'idle') setStatus('idle')
          }}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="license-help"
          className="kb-input mt-3 font-display text-2xl font-bold tracking-wider"
        />
        <p id="license-help" className="mt-2 text-sm font-medium text-black/60">
          Format: XXXX-XXXX-XXXX-XXXX · The key is printed on the license card that came with this kiosk.
        </p>
        <KButton
          tone="blue"
          icon={KeySquare}
          className="mt-4"
          disabled={value.length !== 19 || status === 'checking'}
          onClick={() => void runValidation(value)}
        >
          {status === 'checking' ? 'Checking…' : 'Activate license'}
        </KButton>
      </KCard>

      {status === 'checking' ? (
        <KCard tone="blue" className="flex items-center gap-4">
          <Loader2 className="size-7 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
          <p className="font-display text-lg font-bold">Checking your license key with the Smart Print service…</p>
        </KCard>
      ) : null}

      {status === 'valid' && draft.licenseInfo ? (
        <KCard tone="lime">
          <div className="flex items-center gap-3">
            <BadgeCheck className="size-8 shrink-0" strokeWidth={2.5} aria-hidden />
            <h3 className="font-display text-xl font-bold">License activated</h3>
          </div>
          <div className="mt-4">
            <KeyVal k="Operator" v={draft.licenseInfo.operatorName} />
            <KeyVal k="Kiosk name" v={draft.licenseInfo.kioskName} />
          </div>
        </KCard>
      ) : null}

      {status === 'invalid' ? (
        <KCard tone="coral">
          <StatusPill tone="error" icon={XCircle} className="mb-3">
            Not recognized
          </StatusPill>
          <p className="font-semibold">
            This key was not recognized. Check it for typos and try again — the format is XXXX-XXXX-XXXX-XXXX.
          </p>
        </KCard>
      ) : null}

      {status === 'expired' ? (
        <KCard tone="coral">
          <StatusPill tone="error" icon={TriangleAlert} className="mb-3">
            Expired
          </StatusPill>
          <p className="font-semibold">This license has expired. Contact Smart Print support to renew it.</p>
        </KCard>
      ) : null}

      {status === 'in_use' ? (
        <KCard tone="coral">
          <StatusPill tone="error" icon={TriangleAlert} className="mb-3">
            Already in use
          </StatusPill>
          <p className="font-semibold">
            This key is already active on another kiosk. Every kiosk needs its own license.
          </p>
        </KCard>
      ) : null}
    </div>
  )
}

/* ============================================================
   Step 4 — Device check
   ============================================================ */

const DEVICE_META: Record<string, { label: string; icon: typeof Printer }> = {
  printer: { label: 'Printer', icon: Printer },
  paper: { label: 'Paper level', icon: Files },
  cash: { label: 'Cash acceptor', icon: Banknote },
  storage: { label: 'Storage space', icon: HardDrive },
  bluetooth: { label: 'Bluetooth', icon: Bluetooth },
  usb: { label: 'USB port', icon: Usb },
}

function StepDevices({ onStatus }: { onStatus: (running: boolean, cleared: boolean | null) => void }) {
  const [results, setResults] = useState<import('@/kiosk/lib/types').DeviceStatus[] | null>(null)
  const [running, setRunning] = useState(false)
  const once = useRef(false)

  const run = useCallback(async () => {
    setRunning(true)
    try {
      const list = await deviceCheckService.runChecks()
      setResults(list)
    } finally {
      setRunning(false)
    }
  }, [])

  useEffect(() => {
    if (once.current) return
    once.current = true
    void run()
  }, [run])

  useEffect(() => {
    const blocking = results?.some((r) => r.state === 'fail' && r.blocking) ?? false
    onStatus(running, results === null ? null : !blocking)
  }, [results, running, onStatus])

  const blocking = results?.filter((r) => r.state === 'fail' && r.blocking) ?? []
  const warns = results?.filter((r) => r.state === 'warn') ?? []

  return (
    <div className="flex flex-col gap-5">
      <KCard>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">Hardware check</h3>
          <KButton tone="white" size="md" icon={RefreshCcw} onClick={() => void run()} disabled={running}>
            Recheck
          </KButton>
        </div>

        <ul className="mt-4 flex flex-col gap-2.5">
          {(Object.keys(DEVICE_META) as Array<keyof typeof DEVICE_META>).map((id) => {
            const meta = DEVICE_META[id]
            const r = results?.find((x) => x.id === id)
            const Icon = meta.icon
            return (
              <li key={id} className="flex items-center gap-3 rounded-xl border-[3px] border-black bg-white px-4 py-3">
                <span className="kb-cream flex size-11 shrink-0 items-center justify-center rounded-lg border-[3px] border-black">
                  <Icon className="size-5" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-bold">{meta.label}</span>
                  <span className="block truncate text-sm font-medium text-black/60">
                    {r ? r.detail : 'Checking…'}
                  </span>
                </span>
                <span className="ml-auto shrink-0">
                  {!r ? (
                    <Loader2 className="size-6 animate-spin" strokeWidth={2.5} aria-label="Checking" />
                  ) : r.state === 'ok' ? (
                    <StatusPill tone="ok" icon={CheckCircle2}>
                      OK
                    </StatusPill>
                  ) : r.state === 'warn' ? (
                    <StatusPill tone="warn" icon={TriangleAlert}>
                      Warning
                    </StatusPill>
                  ) : (
                    <StatusPill tone="error" icon={XCircle}>
                      Problem
                    </StatusPill>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </KCard>

      {running === false && blocking.length > 0 ? (
        <KCard tone="coral">
          <StatusPill tone="error" icon={TriangleAlert} className="mb-3">
            Setup cannot continue
          </StatusPill>
          <p className="font-semibold">
            Fix the items marked <strong>Problem</strong> above, then press Recheck. The kiosk cannot serve
            customers until they are working.
          </p>
          <KButton tone="lime" icon={RefreshCcw} className="mt-4" onClick={() => void run()}>
            Recheck
          </KButton>
        </KCard>
      ) : null}

      {running === false && blocking.length === 0 && warns.length > 0 ? (
        <Notice icon={Info}>
          You can continue with warnings — anything marked <strong>Warning</strong> only limits optional
          features.
        </Notice>
      ) : null}
    </div>
  )
}

/* ============================================================
   Step 5 — Configuration
   ============================================================ */

function fmtSeconds(sec: number): string {
  if (sec < 60) return `${sec} s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m} min` : `${m} min ${s} s`
}

function StepConfig({
  draft,
  patch,
  published,
  onLoaded,
}: {
  draft: Draft
  patch: (part: Partial<Draft>) => void
  published: Published | null
  onLoaded: (p: Published) => void
}) {
  const [loading, setLoading] = useState(published === null)
  const once = useRef(false)

  useEffect(() => {
    if (once.current || published) return
    once.current = true
    let cancelled = false
    const load = async () => {
      try {
        const p = await networkSetupService.fetchPublishedSettings(draft.mode ?? 'online')
        if (!cancelled) onLoaded(p)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [draft.mode, published, onLoaded])

  if (loading || !published) {
    return (
      <KCard className="flex items-center gap-4">
        <Loader2 className="size-7 shrink-0 animate-spin" strokeWidth={2.5} aria-hidden />
        <p className="font-display text-lg font-bold">
          {draft.mode === 'offline' ? 'Reading the settings bundled on this kiosk…' : 'Pulling the settings published by your operator…'}
        </p>
      </KCard>
    )
  }

  const s = published.settings
  const paperRows: Array<{ id: 'A4' | 'Letter' | 'A3'; label: string }> = [
    { id: 'A4', label: 'A4' },
    { id: 'Letter', label: 'Letter' },
    { id: 'A3', label: 'A3' },
  ]
  const inputChips = s.allowedInputs.map((input) => {
    if (input === 'qr') return { icon: QrCode, label: 'QR code' }
    if (input === 'bluetooth') return { icon: Bluetooth, label: 'Bluetooth' }
    return { icon: Usb, label: 'USB drive' }
  })
  const methodChips = s.paymentMethods.map((m) =>
    m === 'cash' ? { icon: Banknote, label: 'Cash' } : { icon: Smartphone, label: 'E-wallet' },
  )

  return (
    <div className="flex flex-col gap-5">
      <KCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">Operator settings</h3>
          <StatusPill tone="info" icon={published.source === 'remote' ? CloudDownload : HardDrive}>
            Version {published.version} · {published.source === 'remote' ? 'from Smart Print cloud' : 'bundled on this kiosk'}
          </StatusPill>
        </div>
        <p className="mt-2 text-sm font-medium text-black/60">Read-only — these settings are managed by your operator and update automatically.</p>

        <div className="mt-5 overflow-hidden rounded-xl border-[3px] border-black">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-black font-display text-sm font-bold text-white">
                <th className="px-4 py-2.5">Paper</th>
                <th className="px-4 py-2.5">Black &amp; white</th>
                <th className="px-4 py-2.5">Colored</th>
              </tr>
            </thead>
            <tbody>
              {paperRows.map((row) => (
                <tr key={row.id} className="border-t-[3px] border-black bg-white">
                  <td className="px-4 py-2.5 font-display font-bold">{row.label}</td>
                  <td className="px-4 py-2.5">
                    <Money value={s.prices[row.id].bw} className="text-base" /> / page
                  </td>
                  <td className="px-4 py-2.5">
                    <Money value={s.prices[row.id].color} className="text-base" /> / page
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <KeyVal k="Copy limit" v={`${s.copyLimit.min} – ${s.copyLimit.max} copies`} />
          <KeyVal k="Upload window" v={`QR & Bluetooth ${fmtSeconds(s.timers.upload.qr)} · USB ${fmtSeconds(s.timers.upload.usb)}`} />
          <KeyVal k="Cash payment window" v={fmtSeconds(s.timers.cash)} />
          <KeyVal k="E-wallet payment window" v={fmtSeconds(s.timers.wallet)} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {inputChips.map((c) => (
            <span key={c.label} className="kb-chip min-h-11! gap-2! px-3! py-1.5! text-sm">
              <c.icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              {c.label}
            </span>
          ))}
          {methodChips.map((c) => (
            <span key={c.label} className="kb-chip min-h-11! gap-2! px-3! py-1.5! text-sm">
              <c.icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              {c.label}
            </span>
          ))}
        </div>
      </KCard>

      {/* Operator PIN */}
      <KCard>
        <div className="flex items-center gap-3">
          <span className="kb-blue flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
            <ShieldCheck className="size-6" strokeWidth={2.5} aria-hidden />
          </span>
          <h3 className="font-display text-lg font-bold">Maintenance PIN</h3>
        </div>
        <label htmlFor="operator-pin" className="mt-4 block text-[15px] font-semibold">
          Choose a 6-digit PIN
        </label>
        <input
          id="operator-pin"
          value={draft.pin}
          onChange={(e) => patch({ pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          aria-describedby="pin-help"
          className="kb-input mt-2 max-w-[220px] text-center font-display text-2xl font-bold tracking-[0.5em]"
        />
        <p id="pin-help" className="mt-2 text-sm font-medium text-black/60">
          Opens the protected maintenance screen (press and hold the kiosk logo for 3 seconds).
          The default is 000000 — change it before opening the kiosk to customers.
        </p>
        {!/^\d{6}$/.test(draft.pin) ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-kcoral">
            <TriangleAlert className="size-4" strokeWidth={2.5} aria-hidden /> Enter exactly 6 digits.
          </p>
        ) : null}
      </KCard>
    </div>
  )
}

/* ============================================================
   Step 6 — Finish
   ============================================================ */

function StepFinish({ draft, published }: { draft: Draft; published: Published | null }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <span
        aria-hidden
        className="kb-lime flex size-24 rotate-[-2deg] items-center justify-center rounded-full border-[3px] border-black shadow-[5px_5px_0_#000] sm:size-28"
      >
        <CheckCircle2 className="size-12 sm:size-14" strokeWidth={2.5} />
      </span>
      <KCard tone="lime" className="w-full max-w-xl text-center">
        <h3 className="font-display text-2xl font-bold sm:text-3xl">Your kiosk is ready</h3>
        <p className="mt-2 font-semibold">
          The license is active and the operator settings are stored on this kiosk.
        </p>
        <div className="mt-5 text-left">
          <KeyVal k="Operator" v={draft.licenseInfo?.operatorName ?? '—'} />
          <KeyVal k="Kiosk name" v={draft.licenseInfo?.kioskName ?? '—'} />
          <KeyVal
            k="Mode"
            v={draft.mode === 'offline' ? 'Offline' : draft.wifiSsid ? `Online · ${draft.wifiSsid}` : 'Online'}
          />
          <KeyVal k="Settings version" v={published ? `v${published.version}` : '—'} />
        </div>
      </KCard>
      <p className="max-w-xl text-center text-[15px] font-medium text-black/60">
        Press <strong>Start kiosk</strong> to open the customer screens. You can reopen this setup any time
        from the protected maintenance screen.
      </p>
    </div>
  )
}
