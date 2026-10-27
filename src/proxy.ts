import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { verifyJwt } from '@/lib/jwt'

async function hasValidToken(token?: string) {
  if (!token) return false

  try {
    await verifyJwt(token)
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const onAuth = pathname.startsWith('/auth')
  const token = request.cookies.get(env.COOKIE_ACCESS)?.value
  // checagem barata (assinatura + expiração); o hash no DB é validado em
  // getSessionData, pois o proxy não deve consultar o banco
  const hasAccess = await hasValidToken(token)

  if (!hasAccess && !onAuth) {
    const response = NextResponse.redirect(
      new URL('/auth/sign-in', request.url)
    )
    if (token) response.cookies.delete(env.COOKIE_ACCESS)
    return response
  }

  if (hasAccess && onAuth) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!hasAccess && token) {
    const response = NextResponse.next()
    response.cookies.delete(env.COOKIE_ACCESS)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
