import { index, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { organizations, users } from '.'
import { timestamps } from './columns'
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
    ...timestamps,
  },
  t => [
    uniqueIndex('members_org_user_unique').on(t.organizationId, t.userId),
    // uniqueIndex('members_one_owner_per_org')
    //   .on(t.organizationId)
    //   .where(sql`${t.role} = 'owner'`),
    index('members_user_idx').on(t.userId),
  ]
)

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
