import { ArrowLeft, CheckCircle2, FileText, RotateCcw, Send, TriangleAlert } from 'lucide-react'
import { NBButton } from '@/components/site/NBButton'
import { StickerCard, StatusPill } from '@/components/site/primitives'

const DEMO_FILE = { name: 'Demo-Document.pdf', size: '1.8 MB' }

export default async function PhoneUploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sessionId } = await params
  const { sent, error } = await searchParams
  const expired = error === 'expired' || !/^SP-[A-Za-z0-9-]{1,60}$/.test(sessionId)
  const completed = sent === '1' && !expired

  if (expired) {
    return (
      <div className="flex flex-1 items-center">
        <StickerCard tone="cream" className="w-full p-6 text-center">
          <StatusPill tone="error" icon={TriangleAlert}>Upload session not found</StatusPill>
          <h1 className="mt-4 font-display text-2xl font-bold">This upload window has expired</h1>
          <p className="mt-2 text-sm font-semibold text-black/65">
            Start again at the kiosk, choose QR code, then scan the new code.
          </p>
        </StickerCard>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-black/60">Phone upload demo</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {completed ? 'File sent!' : 'Demo document ready'}
        </h1>
        <p className="mt-2 text-sm font-semibold text-black/65 sm:text-base">
          {completed
            ? 'The kiosk is picking it up right now.'
            : 'Send the built-in sample document to this kiosk with one tap.'}
        </p>
      </div>

      {completed ? (
        <>
          <StickerCard tone="lime" className="flex flex-col items-center gap-4 p-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl border-[3px] border-black bg-white shadow-[3px_3px_0_#000]">
              <CheckCircle2 className="size-9" strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <p className="font-display text-lg font-bold">{DEMO_FILE.name}</p>
              <p className="text-sm font-semibold text-black/70">
                {DEMO_FILE.size} · on its way to the print queue
              </p>
            </div>
            <p className="text-sm font-semibold text-black/70">
              Watch the kiosk — it will scan your document and show the price. You can close
              this page on your phone.
            </p>
          </StickerCard>
          <NBButton
            type="button"
            size="lg"
            className="w-full"
            icon={<ArrowLeft className="size-5" strokeWidth={2.5} aria-hidden />}
          >
            Return to the kiosk
          </NBButton>
        </>
      ) : (
        <StickerCard className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-kpaper p-3 shadow-[3px_3px_0_#000]">
            <span className="kb-lime flex size-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black">
              <FileText className="size-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-display text-sm font-bold sm:text-base">{DEMO_FILE.name}</span>
                <span className="shrink-0 rounded-md border-2 border-black bg-black px-1.5 py-0.5 font-display text-[10px] font-bold uppercase text-klime">Demo</span>
              </span>
              <span className="block text-xs font-bold text-black/60 sm:text-sm">
                {DEMO_FILE.size} · sample document · no personal file needed
              </span>
            </span>
          </div>

          <button
            type="button"
            className="mx-auto flex min-h-11 items-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 font-display text-sm font-bold shadow-[3px_3px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#000]"
          >
            <RotateCcw className="size-4" strokeWidth={2.5} aria-hidden />
            Use a file from this device instead
          </button>

          <form action="/api/upload/file" method="post">
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              className="kb-btn kb-btn-lime flex min-h-16 w-full items-center justify-center gap-2 px-5 text-lg"
            >
              <Send className="size-5" aria-hidden />
              Send demo to kiosk
            </button>
          </form>
          <p className="text-center text-xs font-semibold text-black/55 sm:text-sm">
            This sends demo information only. No file is selected from your device or stored.
          </p>
        </StickerCard>
      )}
    </div>
  )
}
