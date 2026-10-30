import { sql } from 'drizzle-orm'
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { organizations } from '.'
import { money, timestamps } from './columns'
import { unitEnum } from './enums'

export const materials = pgTable(
  'materials',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    brand: text('brand'),
    variant: text('variant'), // cor, tamanho
    imageUrl: text('image_url'),
    purchaseUrl: text('purchase_url'),
    unit: unitEnum('unit').notNull(),
    packagePrice: money('package_price').notNull(),
    packageQuantity: numeric('package_quantity', {
      precision: 14,
      scale: 3,
      mode: 'number',
    }).notNull(),
    unitCost: numeric('unit_cost', { precision: 18, scale: 6, mode: 'number' })
      .notNull()
      .generatedAlwaysAs(sql`package_price / package_quantity`),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestamps,
  },
  t => [
    uniqueIndex('materials_identity_unique').on(
      t.organizationId,
      sql`lower(${t.name})`,
      sql`lower(coalesce(${t.brand}, ''))`,
      sql`lower(coalesce(${t.variant}, ''))`
    ),
    index('materials_org_idx').on(t.organizationId),
    check('materials_package_quantity_positive', sql`${t.packageQuantity} > 0`),
    check('materials_package_price_nonnegative', sql`${t.packagePrice} >= 0`),
  ]
)

export type Material = typeof materials.$inferSelect
export type NewMaterial = typeof materials.$inferInsert
