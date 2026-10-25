import { sql } from 'drizzle-orm'
import { boolean, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { timestamps } from './columns'

export const users = pgTable(
  'users',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    name: text('name').notNull(),
    username: text('username').notNull().unique(),
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    active: boolean().default(true).notNull(),
    imageUrl: text('image_url'),
    ...timestamps,
  },
  t => [uniqueIndex('users_email_unique').on(sql`lower(${t.email})`)]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
