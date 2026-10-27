import 'server-only'

import { and, eq, gt } from 'drizzle-orm'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { cache } from 'react'
import { deleteAuthCookie, getAuthCookie } from '@/lib/auth-cookies'
import { sha256 } from '@/lib/crypto'
import { db } from '../connection'
import { members, usersTokens } from '../schema'
import { takeFirstOrNull } from '../utils'

async function logoutAndRedirect(raw?: string | null): Promise<never> {
  try {
    if (raw) {
      await db.delete(usersTokens).where(eq(usersTokens.tokenHash, sha256(raw)))
    }
  } catch (err) {
    if (isRedirectError(err)) throw err
  }

  await deleteAuthCookie()
  redirect('/auth/sign-in')
}

type Session = {
  userId: string
  role: string
  isAdminUser: boolean
  organizationId: string
}
type SessionData = { raw: string | null; session: Session | null }

export const getSessionData = cache(async (): Promise<SessionData> => {
  const raw = await getAuthCookie()
  if (!raw) return { raw: null, session: null }

  const tokenHash = sha256(raw)

  try {
    const row = await db
      .select({
        userId: usersTokens.userId,
        role: members.role,
        organizationId: members.organizationId,
      })
      .from(usersTokens)
      .innerJoin(members, eq(members.userId, usersTokens.userId))
      .where(
        and(
          eq(usersTokens.tokenHash, tokenHash),
          gt(usersTokens.expiresAt, new Date())
        )
      )
      .then(takeFirstOrNull)

    const isAdminUser = row?.role === 'admin'

    const session = row
      ? {
          userId: row.userId,
          role: row.role,
          isAdminUser,
          organizationId: row.organizationId,
        }
      : null

    return { raw, session }
  } catch (err) {
    if (isRedirectError(err)) throw err
    return await logoutAndRedirect(raw)
  }
})

export const getSession = cache(async () => (await getSessionData()).session)

export async function requireSession(): Promise<Session> {
  await connection()
  const { raw, session } = await getSessionData()

  if (!raw || !session) return logoutAndRedirect(raw)

  return session
}
