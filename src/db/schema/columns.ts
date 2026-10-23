import { sql } from 'drizzle-orm'
import { numeric, timestamp } from 'drizzle-orm/pg-core'

/**
 * Coluna monetária padronizada (2 casas decimais).
 */
export const money = (name: string) =>
  numeric(name, { precision: 12, scale: 2, mode: 'number' })

/**
 * Coluna percentual padronizada (ex: 150.00 = 1.5x).
 */
export const percent = (name: string) =>
  numeric(name, { precision: 8, scale: 2, mode: 'number' })

/**
 * Colunas de datas createdAt & updatedAt.
 */
export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
}
