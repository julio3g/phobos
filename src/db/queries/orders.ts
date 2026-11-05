'use server'

import {
  and,
  type AnyColumn,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '../connection'
import { clients, orders } from '../schema'
import type { GetOrdersSchema, SortableOrderColumn } from '../validators'
import { requireSession } from './auth'

// id da coluna na tabela (?sort=) -> coluna do banco
const sortColumns = {
  number: orders.number,
  status: orders.status,
  paymentStatus: orders.paymentStatus,
  total: orders.total,
  createdAt: orders.createdAt,
} satisfies Record<SortableOrderColumn, AnyColumn>

export async function getOrders(input: GetOrdersSchema) {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      async () => {
        const offset = (input.page - 1) * input.perPage

        const clientSearch = input.client ? `%${input.client}%` : null

        const where = and(
          eq(orders.organizationId, organizationId),
          clientSearch
            ? or(
                ilike(clients.legalName, clientSearch),
                ilike(clients.tradeName, clientSearch)
              )
            : undefined
        )

        const orderBy = [
          ...input.sort.map(item =>
            item.desc ? desc(sortColumns[item.id]) : asc(sortColumns[item.id])
          ),
          // desempate estável entre páginas
          asc(orders.id),
        ]

        const { data, total } = await db.transaction(async tx => {
          const data = await tx
            .select({
              ...getTableColumns(orders),
              clientName: sql<string>`coalesce(nullif(trim(${clients.tradeName}), ''), ${clients.legalName})`,
            })
            .from(orders)
            .innerJoin(clients, eq(clients.id, orders.clientId))
            .where(where)
            .orderBy(...orderBy)
            .limit(input.perPage)
            .offset(offset)

          const total = await tx
            .select({ count: count() })
            .from(orders)
            .innerJoin(clients, eq(clients.id, orders.clientId))
            .where(where)
            .then(res => res[0]?.count ?? 0)

          return { data, total }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      },
      ['orders:list', organizationId, JSON.stringify(input)],
      { revalidate: 1, tags: ['orders'] }
    )()
  } catch (_err) {
    return { data: [], pageCount: 0 }
  }
}

export type OrderListItem = Awaited<ReturnType<typeof getOrders>>['data'][number]

/** Ordem completa (cliente + itens com produto) para ver/editar. */
export async function getOrder(id: string) {
  const { organizationId } = await requireSession()

  const order = await db.query.orders.findFirst({
    where: (fields, { and, eq }) =>
      and(eq(fields.id, id), eq(fields.organizationId, organizationId)),
    with: {
      client: true,
      orderItems: { with: { product: true } },
    },
  })

  return order ?? null
}

export type OrderFull = NonNullable<Awaited<ReturnType<typeof getOrder>>>
