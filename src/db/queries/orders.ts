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
import { unstable_cache } from 'next/cache'
import { db } from '../connection'
import { clients, orders } from '../schema'
import type { GetOrdersSchema, SortableOrderColumn } from '../validators'
import { requireSession } from './auth'

const sortColumns = {
  number: orders.number,
  status: orders.status,
  paymentStatus: orders.paymentStatus,
  total: orders.total,
  createdAt: orders.createdAt,
} satisfies Record<SortableOrderColumn, AnyColumn>

export async function getOrders(input: GetOrdersSchema) {
  const { organizationId, isAdminUser, userId } = await requireSession()
  const scope = `${organizationId}:${isAdminUser ? 'admin' : `user:${userId}`}`
  try {
    return await unstable_cache(
      async () => {
        const offset = (input.page - 1) * input.perPage

        const clientSearch = input.client ? `%${input.client}%` : null

        const where = and(
          eq(orders.organizationId, organizationId),
          input.status.length > 0
            ? inArray(orders.status, input.status)
            : undefined,
          input.paymentStatus.length > 0
            ? inArray(orders.paymentStatus, input.paymentStatus)
            : undefined,
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
          const [data, total] = await Promise.all([
            // a linha já traz tudo que ver/editar precisam (sem busca por id)
            tx.query.orders.findMany({
              with: {
                client: {
                  columns: { legalName: true, tradeName: true },
                  extras: (f, { sql }) => ({
                    clientName:
                      sql<string>`coalesce(nullif(trim(${f.tradeName}), ''), ${f.legalName})`.as(
                        'client_name'
                      ),
                  }),
                },
                orderItems: {
                  columns: {
                    id: true,
                    productId: true,
                    quantity: true,
                    unitPrice: true,
                    total: true,
                  },
                  with: { product: { columns: { name: true, variant: true } } },
                },
              },
              where,
              offset,
              limit: input.perPage,
              orderBy: () => orderBy,
            }),
            tx
              .select({ count: count() })
              .from(orders)
              .where(where)
              .execute()
              .then(res => res[0]?.count ?? 0),
          ])

          return { data, total }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      },
      ['orders:list', organizationId, scope, JSON.stringify(input)],
      { revalidate: 1, tags: ['orders'] }
    )()
  } catch (_err) {
    return { data: [], pageCount: 0 }
  }
}

export type OrderListItem = Awaited<
  ReturnType<typeof getOrders>
>['data'][number]
