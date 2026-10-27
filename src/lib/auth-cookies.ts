'use server'

import { cookies } from 'next/headers'
import { env, isEnv } from '@/env'
import { verifyJwt } from '@/lib/jwt'

export async function setAuthCookie(
  token: string,
  maxAgeSec = 60 * 60 * 24 * 30 // 30d
) {
  const cookieStore = await cookies()
  cookieStore.set(env.COOKIE_ACCESS, token, {
    httpOnly: true,
    secure: isEnv('production'),
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  })
}

export async function deleteAuthCookie() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(env.COOKIE_ACCESS)
  } catch {
    // cookies() write outside Server Action/Route Handler (e.g. mid-render
    // logout redirect) throws — safe to ignore, the redirect still happens
  }
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(env.COOKIE_ACCESS)?.value
}

export async function isAuthenticated() {
  const token = await getAuthCookie()
  if (!token) return false

  try {
    await verifyJwt(token)
    return true
  } catch {
    return false
  }
}
