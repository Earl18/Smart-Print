import { NextRequest, NextResponse } from 'next/server'
import { getUploadSession, registerUploadSession } from '@/lib/data/upload-store'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId || !/^SP-[A-Za-z0-9-]{1,60}$/.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
  }
  try {
    const session = await getUploadSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Session expired or unavailable' }, { status: 404 })
    return NextResponse.json({ session }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'QR storage is unavailable' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  let input: { sessionId?: unknown; kioskName?: unknown; prefs?: { paper?: unknown; color?: unknown; copies?: unknown } }
  try {
    input = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { sessionId, kioskName, prefs } = input
  if (typeof sessionId !== 'string' || !/^SP-[A-Za-z0-9-]{1,60}$/.test(sessionId) ||
      typeof kioskName !== 'string' || kioskName.length > 100 ||
      !prefs || !['A4', 'Letter', 'A3'].includes(String(prefs.paper)) ||
      !['bw', 'color'].includes(String(prefs.color)) ||
      !Number.isInteger(prefs.copies) || Number(prefs.copies) < 1 || Number(prefs.copies) > 10) {
    return NextResponse.json({ error: 'Invalid upload session' }, { status: 400 })
  }
  try {
    const session = await registerUploadSession({
      sessionId,
      kioskName,
      prefs: { paper: prefs.paper as 'A4' | 'Letter' | 'A3', color: prefs.color as 'bw' | 'color', copies: prefs.copies as number },
    })
    return NextResponse.json({ session }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'QR storage is unavailable' }, { status: 503 })
  }
}
