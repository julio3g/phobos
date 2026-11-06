'use server'

import { and, desc, eq, ne, sql } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import {
  APP_TIMEZONE,
  type DateRangeStrings,
  eachDay,
  type ResolvedRange,
} from '@/lib/date-range'
import { db } from '../connection'
import { clients, orderItems, orders, products } from '../schema'
import { requireSession } from './auth'

// Dia da ordem no fuso do app. createdAt é `timestamp` sem fuso, gravado em UTC.
// O fuso vai como literal (não parâmetro) para o GROUP BY casar com o SELECT.
const orderDay = sql`((${orders.createdAt} at time zone 'UTC') at time zone ${sql.raw(`'${APP_TIMEZONE}'`)})::date`

const numeric = (expr: ReturnType<typeof sql>) =>
  sql<number>`coalesce(${expr}, 0)::float8`

async function totalsInRange(organizationId: string, range: DateRangeStrings) {
  const [row] = await db
    .select({
      revenue: numeric(sql`sum(${orders.total})`),
      profit: numeric(sql`sum(${orders.total} - ${orders.costTotal})`),
      // saldo ainda não pago das ordens do período (sem canceladas)
      receivable: numeric(
        sql`sum(greatest(${orders.total} - ${orders.paidAmount}, 0))`
      ),
      orders: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.organizationId, organizationId),
        ne(orders.status, 'cancelled'),
        sql`${orderDay} between ${range.from}::date and ${range.to}::date`
      )
    )

  const revenue = row?.revenue ?? 0
  const count = row?.orders ?? 0

  return {
    revenue,
    profit: row?.profit ?? 0,
    receivable: row?.receivable ?? 0,
    orders: count,
    avgTicket: count > 0 ? revenue / count : 0,
  }
}

export type DashboardTotals = Awaited<ReturnType<typeof totalsInRange>>

async function loadDashboard(organizationId: string, range: ResolvedRange) {
  const inRange = and(
    eq(orders.organizationId, organizationId),
    sql`${orderDay} between ${range.from}::date and ${range.to}::date`
  )
  const notCancelled = ne(orders.status, 'cancelled')

  const [current, previous, dailyRows, statusRows, topProducts, recentOrders] =
    await Promise.all([
      totalsInRange(organizationId, range),
      totalsInRange(organizationId, range.previous),
      db
        .select({
          day: sql<string>`to_char(${orderDay}, 'YYYY-MM-DD')`,
          revenue: numeric(sql`sum(${orders.total})`),
          profit: numeric(sql`sum(${orders.total} - ${orders.costTotal})`),
          orders: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(and(inRange, notCancelled))
        .groupBy(sql`1`),
      db
        .select({
          status: orders.status,
          orders: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(inRange)
        .groupBy(orders.status),
      db
        .select({
          id: products.id,
          name: products.name,
          variant: products.variant,
          revenue: numeric(sql`sum(${orderItems.total})`),
          quantity: numeric(sql`sum(${orderItems.quantity})`),
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .where(and(inRange, notCancelled))
        .groupBy(products.id, products.name, products.variant)
        .orderBy(desc(sql`sum(${orderItems.total})`))
        .limit(5),
      db
        .select({
          id: orders.id,
          number: orders.number,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
          clientName: sql<string>`coalesce(nullif(trim(${clients.tradeName}), ''), ${clients.legalName})`,
        })
        .from(orders)
        .innerJoin(clients, eq(clients.id, orders.clientId))
        .where(eq(orders.organizationId, organizationId))
        .orderBy(desc(orders.createdAt))
        .limit(5),
    ])

  // um ponto por dia (dias sem venda = 0), para o gráfico não "pular" datas
  const byDay = new Map(dailyRows.map(row => [row.day, row]))
  const daily = eachDay(range).map(date => ({
    date,
    revenue: byDay.get(date)?.revenue ?? 0,
    profit: byDay.get(date)?.profit ?? 0,
    orders: byDay.get(date)?.orders ?? 0,
  }))

  return {
    current,
    previous,
    daily,
    statusCounts: statusRows,
    topProducts,
    recentOrders,
  }
}

export async function getDashboard(range: ResolvedRange) {
  const { organizationId } = await requireSession()

  return unstable_cache(
    () => loadDashboard(organizationId, range),
    ['dashboard-v2', organizationId, range.from, range.to],
    { revalidate: 60, tags: ['orders'] }
  )()
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>
