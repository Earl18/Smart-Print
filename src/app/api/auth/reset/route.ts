import { NextResponse } from 'next/server'

/** Completes a password reset from the link issued by /forgot-password. */
export async function POST(request: Request) {
  let body: { token?: string; password?: string }
  try {
    body = (await request.json()) as { token?: string; password?: string }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const token = (body.token ?? '').trim()
  const password = body.password ?? ''
  if (!token) {
    return NextResponse.json({ ok: false, error: 'This reset link is invalid. Request a new one.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: 'Choose a password with at least 8 characters.' }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    message: 'Your password has been updated. You can sign in with it now.',
  })
}
