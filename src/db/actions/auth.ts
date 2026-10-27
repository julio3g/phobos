'use server'

import { and, asc, eq, sql } from 'drizzle-orm'
import { decodeJwt } from 'jose'
import { connection } from 'next/server'
import { db } from '@/db/connection'
import { requireSession } from '@/db/queries'
import { type Member, members, users, usersTokens } from '@/db/schema'
import { takeFirstOrNull, takeFirstOrThrow } from '@/db/utils'
import {
  deleteAuthCookie,
  getAuthCookie,
  setAuthCookie,
} from '@/lib/auth-cookies'
import { sha256 } from '@/lib/crypto'
import { getErrorMessage } from '@/lib/handle-error'
import { signJwt } from '@/lib/jwt'
import { getDummyHash, verifyPassword } from '@/lib/password'

export async function createUserSession(
  member: Pick<Member, 'userId' | 'role'>
) {
  const token = await signJwt({ sub: member.userId, role: member.role })

  const { exp } = decodeJwt(token)
  if (!exp) throw new Error('Falha ao criar access token')

  await db.insert(usersTokens).values({
    userId: member.userId,
    tokenHash: sha256(token),
    expiresAt: new Date(exp * 1000),
  })

  await setAuthCookie(token)
}

export async function signIn(input: { identifier: string; password: string }) {
  await connection()
  try {
    const identifier = input.identifier.toLowerCase().trim()

    // "@" não é permitido em username, então identifica o tipo pelo valor
    const user = await db.query.users.findFirst({
      where: identifier.includes('@')
        ? eq(sql`lower(${users.email})`, identifier)
        : eq(users.username, identifier),
    })

    const passwordMatch = await verifyPassword(
      user?.passwordHash ?? (await getDummyHash()),
      input.password
    )
    if (!user || !passwordMatch) {
      throw new Error('Usuário/e-mail ou senha incorretos.')
    }

    const member = await db
      .select({ userId: members.userId, role: members.role })
      .from(members)
      .where(eq(members.userId, user.id))
      .orderBy(asc(members.createdAt))
      .then(takeFirstOrThrow)

    if (!member) throw new Error('Usuário sem organização.')

    await createUserSession(member)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function signOut() {
  await connection()
  try {
    const token = await getAuthCookie()

    if (token) {
      await db
        .delete(usersTokens)
        .where(eq(usersTokens.tokenHash, sha256(token)))
    }

    await deleteAuthCookie()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function revokeSession(sessionId: string) {
  await connection()
  try {
    const { userId } = await requireSession()
    const raw = await getAuthCookie()

    const deleted = await db
      .delete(usersTokens)
      .where(and(eq(usersTokens.id, sessionId), eq(usersTokens.userId, userId)))
      .returning({ tokenHash: usersTokens.tokenHash })
      .then(takeFirstOrNull)

    if (deleted && raw && deleted.tokenHash === sha256(raw)) {
      await deleteAuthCookie()
    }

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function signOutAllDevices() {
  const { userId } = await requireSession()

  await db.delete(usersTokens).where(eq(usersTokens.userId, userId))
  await deleteAuthCookie()
}
