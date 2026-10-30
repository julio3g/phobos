import { sql } from 'drizzle-orm'
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { money, timestamps } from './columns'
import { marginTypeEnum } from './enums'
import { organizations } from './organizations'

export const products = pgTable(
  'products',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    variant: text('variant'),
    imageUrl: text('image_url'),
    description: text('description'),
    value: money('value'),
    laborMinutes: integer('labor_minutes').notNull().default(0),
    marginType: marginTypeEnum('margin_type').notNull().default('percent'),
    marginValue: money('margin_value').notNull(),
    materialCost: money('material_cost').notNull().default(0),
    laborCost: money('labor_cost').notNull().default(0),
    totalCost: money('total_cost')
      .notNull()
      .generatedAlwaysAs(sql`material_cost + labor_cost`),
    salePrice: money('sale_price').notNull().default(0),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestamps,
  },
  t => [
    uniqueIndex('products_identity_unique').on(
      t.organizationId,
      sql`lower(${t.name})`,
      sql`lower(coalesce(${t.variant}, ''))`
    ),
    check('products_labor_minutes_nonnegative', sql`${t.laborMinutes} >= 0`),
    check('products_margin_nonnegative', sql`${t.marginValue} >= 0`),
    check(
      'products_margin_percent_range',
      sql`${t.marginType} <> 'percent' or ${t.marginValue} < 100`
    ),
  ]
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
