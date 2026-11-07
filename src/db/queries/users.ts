'use server'

import {
  type AnyColumn,
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
} from 'drizzle-orm'
import { db } from '../connection'
import { members, users } from '../schema'
import type { userRoleEnum } from '../schema/enums'
import type { GetUsersSchema, SortableUserColumn } from '../validators'
import { requireSession } from './auth'

const sortColumns = {
  name: users.name,
  email: users.email,
  role: members.role,
  createdAt: users.createdAt,
} satisfies Record<SortableUserColumn, AnyColumn>

export type MemberListItem = {
  id: string
  name: string
  username: string
  email: string
  imageUrl: string | null
  active: boolean
  role: (typeof userRoleEnum.enumValues)[number]
  createdAt: Date
}

export async function getMembers(input: GetUsersSchema) {
  const { organizationId } = await requireSession()
  try {
    const offset = (input.page - 1) * input.perPage
    const search = input.name ? `%${input.name}%` : null

    const where = and(
      eq(members.organizationId, organizationId),
      input.role.length ? inArray(members.role, input.role) : undefined,
      search
        ? or(
            ilike(users.name, search),
            ilike(users.username, search),
            ilike(users.email, search)
          )
        : undefined
    )

    const orderBy = [
      ...input.sort.map(item =>
        item.desc ? desc(sortColumns[item.id]) : asc(sortColumns[item.id])
      ),
      asc(users.id),
    ]

    const [data, total] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          imageUrl: users.imageUrl,
          active: users.active,
          role: members.role,
          createdAt: users.createdAt,
        })
        .from(members)
        .innerJoin(users, eq(users.id, members.userId))
        .where(where)
        .orderBy(...orderBy)
        .limit(input.perPage)
        .offset(offset),
      db
        .select({ count: count() })
        .from(members)
        .innerJoin(users, eq(users.id, members.userId))
        .where(where)
        .then(res => res[0]?.count ?? 0),
    ])

    return { data, pageCount: Math.ceil(total / input.perPage) }
  } catch (_err) {
    return { data: [] as MemberListItem[], pageCount: 0 }
  }
}

/** Usuário logado (avatar do header). */
export async function getProfile() {
  const { userId, role } = await requireSession()
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .then(rows => rows[0] ?? null)

  return user
    ? { ...user, role: role as (typeof userRoleEnum.enumValues)[number] }
    : null
}
