import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { users } from '.'
import { timestamps } from './columns'

export const organizations = pgTable('organizations', {
  id: text('id')
    .$defaultFn(() => generateId())
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('name').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lastOrderNumber: integer('last_order_number').notNull().default(0),
  ...timestamps,
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
