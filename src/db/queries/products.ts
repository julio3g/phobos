'use server'

import { type AnyColumn, and, asc, count, desc, eq, ilike } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '../connection'
import { materials, productMaterials, products } from '../schema'
import type { GetProductsSchema, SortableProductColumn } from '../validators'
import { requireSession } from './auth'

// id da coluna na tabela (?sort=) -> coluna do banco
const sortColumns = {
  name: products.name,
  variant: products.variant,
  totalCost: products.totalCost,
  salePrice: products.salePrice,
  createdAt: products.createdAt,
} satisfies Record<SortableProductColumn, AnyColumn>

export async function getProducts(input: GetProductsSchema) {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      async () => {
        const offset = (input.page - 1) * input.perPage

        const where = and(
          eq(products.organizationId, organizationId),
          input.name ? ilike(products.name, `%${input.name}%`) : undefined
        )

        const orderBy = [
          ...input.sort.map(item =>
            item.desc ? desc(sortColumns[item.id]) : asc(sortColumns[item.id])
          ),
          // desempate estável entre páginas
          asc(products.id),
        ]

        const { data, total } = await db.transaction(async tx => {
          const data = await tx
            .select()
            .from(products)
            .where(where)
            .orderBy(...orderBy)
            .limit(input.perPage)
            .offset(offset)

          const total = await tx
            .select({ count: count() })
            .from(products)
            .where(where)
            .then(res => res[0]?.count ?? 0)

          return { data, total }
        })

        const pageCount = Math.ceil(total / input.perPage)
        return { data, pageCount }
      },
      ['products:list', organizationId, JSON.stringify(input)],
      { revalidate: 1, tags: ['products'] }
    )()
  } catch (_err) {
    return { data: [], pageCount: 0 }
  }
}

// Implementar paginação para depois usar scroll infinito no popover
export async function getAllProducts() {
  const { organizationId } = await requireSession()
  try {
    return await unstable_cache(
      async () => {
        const data = await db
          .select()
          .from(products)
          .where(eq(products.organizationId, organizationId))
        return { data }
      },
      ['products-all', organizationId],
      { revalidate: 1, tags: ['products'] }
    )()
  } catch (_err) {
    return { data: [] }
  }
}

/** Produto + composição (snapshot salvo) + custo atual dos materiais. */
export async function getProductDetail(id: string) {
  const { organizationId } = await requireSession()

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.organizationId, organizationId)),
  })
  if (!product) return null

  const lines = await db
    .select({
      id: productMaterials.id,
      materialId: productMaterials.materialId,
      name: materials.name,
      brand: materials.brand,
      variant: materials.variant,
      unit: materials.unit,
      quantity: productMaterials.quantity,
      unitCost: productMaterials.unitCost,
      totalCost: productMaterials.totalCost,
      currentUnitCost: materials.unitCost,
    })
    .from(productMaterials)
    .innerJoin(materials, eq(materials.id, productMaterials.materialId))
    .where(eq(productMaterials.productId, product.id))
    .orderBy(asc(materials.name))

  return { product, lines }
}
