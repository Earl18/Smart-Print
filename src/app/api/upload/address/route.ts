import { networkInterfaces } from 'node:os'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export function GET(request: NextRequest) {
  const url = new URL(request.url)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    const addresses = Object.values(networkInterfaces()).flatMap((items) => items ?? [])
    const lan = addresses.find((item) => item.family === 'IPv4' && !item.internal &&
      (/^192\.168\./.test(item.address) || /^10\./.test(item.address) || /^172\.(1[6-9]|2\d|3[01])\./.test(item.address)))
    if (lan) url.hostname = lan.address
  }
  return NextResponse.json({ origin: url.origin })
}
