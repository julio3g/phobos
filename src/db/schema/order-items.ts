import { relations } from 'drizzle-orm'
import { numeric, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { orders, products } from '.'
import { money, timestamps } from './columns'

export const orderItems = pgTable('order_items', {
  id: text('id')
    .$defaultFn(() => generateId())
    .primaryKey(),
  orderId: text('organization_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  quantity: numeric('quantity', { mode: 'number' }).notNull(),
  unitPrice: money('unit_price').notNull(), // copia do salePrice do product
  unitCost: money('unit_cost').notNull(), // copia do saleCost do product
  total: money('total').notNull(),
  ...timestamps,
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  service: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))
