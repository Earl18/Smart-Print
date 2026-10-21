import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'sp_session'

/**
 * Role-based gate: unauthenticated visitors are sent to sign-in.
 * Signed-in users with the wrong role see the polite "No access"
 * page inside the dashboard itself (handled client-side).
 */
export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
  if (hasSession) return NextResponse.next()

  const login = new URL('/login', request.url)
  login.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ['/operator', '/operator/:path*', '/admin', '/admin/:path*'],
}
