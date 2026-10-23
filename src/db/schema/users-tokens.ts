import { relations } from 'drizzle-orm'
import { index, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { users } from '.'
import { timestamps } from './columns'

export const usersTokens = pgTable(
  'user_tokens',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    ...timestamps,
  },
  t => [
    uniqueIndex('user_tokens_hash_unique').on(t.tokenHash),
    index('user_tokens_user_idx').on(t.userId),
  ]
)

export const usersTokensRelations = relations(usersTokens, ({ one }) => ({
  user: one(users, { fields: [usersTokens.userId], references: [users.id] }),
}))

export type UserToken = typeof usersTokens.$inferSelect
export type NewUserToken = typeof usersTokens.$inferInsert
