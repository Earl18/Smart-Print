import { NextResponse } from 'next/server'
import { findUserByCredentials, toPublicUser } from '@/lib/data/db'
import { setSessionCookie } from '@/lib/auth/session'

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = (await request.json()) as { email?: string; password?: string }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim()
  const password = body.password ?? ''
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: 'Enter your email and password.' },
      { status: 400 },
    )
  }

  const user = findUserByCredentials(email, password)
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Email or password is incorrect.' },
      { status: 401 },
    )
  }
  if (user.status === 'suspended') {
    return NextResponse.json(
      { ok: false, error: 'This account is suspended. Contact a Smart Print administrator.' },
      { status: 403 },
    )
  }

  await setSessionCookie(user.id)
  // `token` mirrors the session cookie for browsers that drop cookies
  // (embedded preview iframes) — the client sends it as x-session-token.
  return NextResponse.json({ ok: true, user: toPublicUser(user), token: user.id })
}
