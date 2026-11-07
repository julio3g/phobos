'use server'

import { and, eq, ne, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { connection } from 'next/server'
import { getErrorMessage } from '@/lib/handle-error'
import { hashPassword, verifyPassword } from '@/lib/password'
import { db } from '../connection'
import { requireSession } from '../queries'
import { members, users, usersTokens } from '../schema'
import { takeFirstOrNull, takeFirstOrThrow } from '../utils'
import type {
  ChangePasswordSchema,
  CreateUserSchema,
  UpdateMemberRoleSchema,
  UpdateUserSchema,
} from '../validators'

function revalidateUsersCache() {
  revalidatePath('/settings/users')
}

/** Membro da organização logada; erro se o usuário não pertence a ela. */
async function getOrgMember(organizationId: string, userId: string) {
  return db
    .select({ id: members.id, userId: members.userId, role: members.role })
    .from(members)
    .where(
      and(
        eq(members.organizationId, organizationId),
        eq(members.userId, userId)
      )
    )
    .then(rows => takeFirstOrThrow(rows, 'Usuário não encontrado!'))
}

async function assertUniqueIdentity(
  input: Pick<UpdateUserSchema, 'username' | 'email'>,
  ignoreUserId?: string
) {
  const notSelf = ignoreUserId ? ne(users.id, ignoreUserId) : undefined

  const [byUsername, byEmail] = await Promise.all([
    db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, input.username), notSelf))
      .then(takeFirstOrNull),
    db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(sql`lower(${users.email})`, input.email), notSelf))
      .then(takeFirstOrNull),
  ])

  if (byUsername) throw new Error(`O usuário "${input.username}" já existe`)
  if (byEmail) throw new Error(`O e-mail "${input.email}" já está em uso`)
}

/** Cria o usuário e já o vincula à organização logada. */
export async function createUser(input: CreateUserSchema) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem criar usuários')

    await assertUniqueIdentity(input)

    const { password, role, ...profile } = input
    const passwordHash = await hashPassword(password)

    const data = await db.transaction(async tx => {
      const user = await tx
        .insert(users)
        .values({ ...profile, passwordHash })
        .returning({ id: users.id, name: users.name, username: users.username })
        .then(takeFirstOrThrow)

      await tx.insert(members).values({ organizationId, userId: user.id, role })

      return user
    })

    revalidateUsersCache()

    return { data, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Admin edita membro da organização; qualquer um edita o próprio perfil. */
export async function updateUser({
  id,
  ...input
}: UpdateUserSchema & { id: string }) {
  await connection()
  const { isAdminUser, organizationId, userId } = await requireSession()
  try {
    if (!isAdminUser && id !== userId)
      throw new Error('Você só pode editar o seu próprio perfil')

    await getOrgMember(organizationId, id)
    await assertUniqueIdentity(input, id)

    await db.update(users).set(input).where(eq(users.id, id))

    revalidateUsersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateMemberRole({
  id,
  ...input
}: UpdateMemberRoleSchema & { id: string }) {
  await connection()
  const { isAdminUser, organizationId, userId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem alterar permissões')
    if (id === userId)
      throw new Error('Você não pode alterar a sua própria permissão')

    const member = await getOrgMember(organizationId, id)
    if (member.role === 'owner')
      throw new Error('A permissão do proprietário não pode ser alterada')

    await db
      .update(members)
      .set({ role: input.role })
      .where(eq(members.id, member.id))

    revalidateUsersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Ativa/desativa. Desativar derruba as sessões abertas do usuário. */
export async function setUserActive(input: { id: string; active: boolean }) {
  await connection()
  const { isAdminUser, organizationId, userId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem desativar usuários')
    if (input.id === userId && !input.active)
      throw new Error('Você não pode desativar a si mesmo')

    const member = await getOrgMember(organizationId, input.id)
    if (member.role === 'owner' && !input.active)
      throw new Error('O proprietário não pode ser desativado')

    await db.transaction(async tx => {
      await tx
        .update(users)
        .set({ active: input.active })
        .where(eq(users.id, input.id))

      if (!input.active)
        await tx.delete(usersTokens).where(eq(usersTokens.userId, input.id))
    })

    revalidateUsersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Remove da organização. O usuário em si não é apagado. */
export async function removeMember(input: { id: string }) {
  await connection()
  const { isAdminUser, organizationId, userId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem remover usuários')
    if (input.id === userId) throw new Error('Você não pode remover a si mesmo')

    const member = await getOrgMember(organizationId, input.id)
    if (member.role === 'owner')
      throw new Error('O proprietário não pode ser removido')

    await db.delete(members).where(eq(members.id, member.id))

    revalidateUsersCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Troca a própria senha e encerra as outras sessões. */
export async function changePassword(input: ChangePasswordSchema) {
  await connection()
  const { userId } = await requireSession()
  try {
    const user = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .then(takeFirstOrThrow)

    const match =
      user.passwordHash &&
      (await verifyPassword(user.passwordHash, input.currentPassword))
    if (!match) throw new Error('Senha atual incorreta.')

    const passwordHash = await hashPassword(input.newPassword)

    await db.transaction(async tx => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, userId))
      await tx.delete(usersTokens).where(eq(usersTokens.userId, userId))
    })

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
