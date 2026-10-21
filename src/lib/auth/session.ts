/* Server-side session helpers — cookie ↔ user round-trip. */
import { cookies, headers } from 'next/headers'
import { findUserById, toPublicUser } from '@/lib/data/db'
import type { PublicUser } from '@/lib/data/types'

export const SESSION_COOKIE = 'sp_session'
/** Fallback session id header for browsers that drop cookies (embedded previews). */
export const SESSION_HEADER = 'x-session-token'
const SEVEN_DAYS = 60 * 60 * 24 * 7

export async function setSessionCookie(userId: string): Promise<void> {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

/** The signed-in user for the current request, or null. */
export async function getSessionUser(): Promise<PublicUser | null> {
  let id = (await cookies()).get(SESSION_COOKIE)?.value
  if (!id) {
    // Some embeds (cross-site iframes) silently drop SameSite cookies — the
    // client keeps the same session id in localStorage and sends it as a header.
    id = (await headers()).get(SESSION_HEADER) ?? undefined
  }
  if (!id) return null
  const user = findUserById(id)
  if (!user || user.status !== 'active') return null
  return toPublicUser(user)
}
