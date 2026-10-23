import { sql } from 'drizzle-orm'
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { organizations, users } from '.'
import { userRoleEnum } from './enums'

export const members = pgTable(
  'members',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .default(sql`current_timestamp`)
      .$onUpdate(() => new Date()),
  },
  t => [
    uniqueIndex('members_org_user_unique').on(t.organizationId, t.userId),
    index('members_user_idx').on(t.userId),
  ]
)

export type Member = typeof users.$inferSelect
export type NewMember = typeof users.$inferInsert
