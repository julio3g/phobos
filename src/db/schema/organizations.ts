import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { clients, materials, members, orders, products } from '.'
import { timestamps } from './columns'

export const organizations = pgTable('organizations', {
  id: text('id')
    .$defaultFn(() => generateId())
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  lastOrderNumber: integer('last_order_number').notNull().default(0),
  ...timestamps,
})

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  materials: many(materials),
  products: many(products),
  clients: many(clients),
  orders: many(orders),
}))

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
