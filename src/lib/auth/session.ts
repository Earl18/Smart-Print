/* Server-side session helpers — cookie ↔ user round-trip. */
import { cookies } from 'next/headers'
import { findUserById, toPublicUser } from '@/lib/data/db'
import type { PublicUser } from '@/lib/data/types'

export const SESSION_COOKIE = 'sp_session'
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
  const jar = await cookies()
  const id = jar.get(SESSION_COOKIE)?.value
  if (!id) return null
  const user = findUserById(id)
  if (!user || user.status !== 'active') return null
  return toPublicUser(user)
}
