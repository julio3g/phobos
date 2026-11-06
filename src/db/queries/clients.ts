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
  sql,
} from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { parseListFilter } from '@/lib/filter-params'
import { db } from '../connection'
import { clients } from '../schema'
import { personTypeEnum } from '../schema/enums'
import type { GetClientsSchema, SortableClientColumn } from '../validators'
import { requireSession } from './auth'

// id da coluna na tabela (?sort=) -> coluna do banco
const sortColumns = {
  legalName: clients.legalName,
  personType: clients.personType,
  city: clients.city,
  createdAt: clients.createdAt,
} satisfies Record<SortableClientColumn, AnyColumn>

export async function getClients(input: GetClientsSchema) {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      async () => {
        const offset = (input.page - 1) * input.perPage
        const search = input.legalName ? `%${input.legalName}%` : null

        const personTypes = parseListFilter(
          input.personType,
          personTypeEnum.enumValues
        )

        const where = and(
          eq(clients.organizationId, organizationId),
          personTypes.length
            ? inArray(clients.personType, personTypes)
            : undefined,
          search
            ? or(
                ilike(clients.legalName, search),
                ilike(clients.tradeName, search)
              )
            : undefined
        )

        const orderBy = [
          ...input.sort.map(item =>
            item.desc ? desc(sortColumns[item.id]) : asc(sortColumns[item.id])
          ),
          // desempate estável entre páginas
          asc(clients.id),
        ]

        const [data, total] = await Promise.all([
          db
            .select()
            .from(clients)
            .where(where)
            .orderBy(...orderBy)
            .limit(input.perPage)
            .offset(offset),
          db
            .select({ count: count() })
            .from(clients)
            .where(where)
            .then(rows => rows[0]?.count ?? 0),
        ])

        return { data, pageCount: Math.ceil(total / input.perPage) }
      },
      ['clients:list', organizationId, JSON.stringify(input)],
      { revalidate: 1, tags: ['clients'] }
    )()
  } catch (_err) {
    return { data: [], pageCount: 0 }
  }
}

// nome fantasia pode estar vazio ('') ou nulo: nesses casos vale a razão social
const displayName = sql<string>`coalesce(nullif(trim(${clients.tradeName}), ''), ${clients.legalName})`

/** Opções (id + nome) para selects de cliente. */
export async function getAllClients() {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      async () => {
        const data = await db
          .select({ id: clients.id, name: displayName })
          .from(clients)
          .where(eq(clients.organizationId, organizationId))
          .orderBy(asc(displayName))
        return { data }
      },
      ['clients-all', organizationId],
      { revalidate: 1, tags: ['clients'] }
    )()
  } catch (_err) {
    return { data: [] }
  }
}
