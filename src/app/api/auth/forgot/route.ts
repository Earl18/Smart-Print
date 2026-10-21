import { NextResponse } from 'next/server'

/** Issues a reset link. The response is always the same so the endpoint
    cannot be used to learn whether an email has an account. */
export async function POST(request: Request) {
  let body: { email?: string }
  try {
    body = (await request.json()) as { email?: string }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    message: 'If that email has a Smart Print account, a reset link is on its way. Check your inbox.',
  })
}
