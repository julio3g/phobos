import { relations, sql } from 'drizzle-orm'
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { clients, orderItems, organizations } from '.'
import { money, timestamps } from './columns'
import { orderStatusEnum, paymentStatusEnum } from './enums'

export const orders = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => generateId())
    .primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  status: orderStatusEnum('status').notNull().default('draft'),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),
  paymentStatus: paymentStatusEnum('payment_status')
    .notNull()
    .default('pending'),
  // subtotal e costTotal = soma dos itens (gravados pela aplicação na mesma
  // transação). total é calculado pelo banco. Lucro = total - costTotal.
  subtotal: money('subtotal').notNull().default(0),
  discount: money('discount').notNull().default(0),
  shipping: money('shipping').notNull().default(0),
  costTotal: money('cost_total').notNull().default(0),
  paidAmount: money('paid_amount').notNull().default(0),
  notes: varchar('notes', { length: 150 }),
  total: money('total')
    .notNull()
    .generatedAlwaysAs(sql`subtotal - discount + shipping`), // total final da ordem de serviço (contendo ou não desconto)
  ...timestamps,
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, { fields: [orders.clientId], references: [clients.id] }),
  orderItems: many(orderItems),
}))

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
