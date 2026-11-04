import { relations } from 'drizzle-orm'
import { index, numeric, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { generateId } from '@/lib/id'
import { money, timestamps } from './columns'
import { materials } from './materials'
import { products } from './products'

/**
 * Composição do produto. unitCost/totalCost são snapshot do momento em que
 * o produto foi salvo/recalculado: alterar o preço do material não muda
 * produtos já salvos até um recálculo explícito.
 */
export const productMaterials = pgTable(
  'product_materials',
  {
    id: text('id')
      .$defaultFn(() => generateId())
      .primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    materialId: text('material_id')
      .notNull()
      .references(() => materials.id, { onDelete: 'restrict' }),
    // na unidade-base do material
    quantity: numeric('quantity', {
      precision: 14,
      scale: 3,
      mode: 'number',
    }).notNull(),
    unitCost: numeric('unit_cost', {
      precision: 18,
      scale: 6,
      mode: 'number',
    }).notNull(),
    totalCost: money('total_cost').notNull(),
    ...timestamps,
  },
  t => [
    uniqueIndex('product_materials_unique').on(t.productId, t.materialId),
    index('product_materials_material_idx').on(t.materialId),
  ]
)

export const productMaterialsRelations = relations(
  productMaterials,
  ({ one }) => ({
    product: one(products, {
      fields: [productMaterials.productId],
      references: [products.id],
    }),
    material: one(materials, {
      fields: [productMaterials.materialId],
      references: [materials.id],
    }),
  })
)

export type ProductMaterial = typeof productMaterials.$inferSelect
export type NewProductMaterial = typeof productMaterials.$inferInsert
