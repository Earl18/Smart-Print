import { NextRequest, NextResponse } from 'next/server'
import { removeExpiredUploadBlobs } from '@/lib/data/upload-store'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const removed = await removeExpiredUploadBlobs()
    return NextResponse.json({ removed })
  } catch {
    return NextResponse.json({ error: 'QR cleanup failed' }, { status: 503 })
  }
}
