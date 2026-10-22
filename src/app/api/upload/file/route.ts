import { NextRequest, NextResponse } from 'next/server'
import { clearUploadedFile, getUploadedFile, getUploadSession, setUploadedFile } from '@/lib/data/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
  const file = getUploadedFile(sessionId)
  return NextResponse.json({ status: file ? 'received' : 'waiting', file })
}

export async function POST(request: NextRequest) {
  // The phone only signals a built-in demo document. File bodies are not accepted.
  const contentType = request.headers.get('content-type') ?? ''
  const fromForm = contentType.includes('application/x-www-form-urlencoded')
  if (!fromForm && !contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Only demo uploads are supported' }, { status: 415 })
  }
  let sessionId: unknown
  try {
    sessionId = fromForm
      ? (await request.formData()).get('sessionId')
      : ((await request.json()) as { sessionId?: unknown }).sessionId
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (typeof sessionId !== 'string' || !/^SP-[A-Za-z0-9-]{1,60}$/.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid demo session' }, { status: 400 })
  }
  if (!getUploadSession(sessionId)) {
    if (fromForm) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/upload/${encodeURIComponent(sessionId)}?error=expired` },
      })
    }
    return NextResponse.json({ error: 'Upload session expired or unavailable' }, { status: 404 })
  }
  setUploadedFile(sessionId, {
    fileName: 'Demo-Document.pdf',
    sizeBytes: 1_842_000,
    fileType: 'pdf',
    receivedAt: Date.now(),
  })
  if (fromForm) {
    // A relative redirect keeps the phone on the LAN host it scanned.
    return new Response(null, {
      status: 303,
      headers: { Location: `/upload/${encodeURIComponent(sessionId)}?sent=1` },
    })
  }
  return NextResponse.json({ status: 'received' })
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
  clearUploadedFile(sessionId)
  return NextResponse.json({ status: 'cleared' })
}
