'use server'

import { and, eq, inArray, ne, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { connection } from 'next/server'
import { getErrorMessage } from '@/lib/handle-error'
import { round2 } from '@/lib/number'
import {
  calcLaborCost,
  calcMaterialLineCost,
  calcSalePrice,
  type MarginType,
} from '@/lib/pricing'
import { db } from '../connection'
import { requireSession } from '../queries'
import { materials, productMaterials, products } from '../schema'
import { takeFirstOrThrow } from '../utils'
import type { CreateProductSchema, UpdateProductSchema } from '../validators'

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

function revalidateProductsCache() {
  revalidateTag('products', 'max')
  revalidatePath('/products')
}

// mesma identidade do índice único products_identity_unique
function sameIdentity(
  organizationId: string,
  input: Pick<CreateProductSchema, 'name' | 'variant'>
) {
  return and(
    eq(products.organizationId, organizationId),
    sql`lower(${products.name}) = lower(${input.name})`,
    sql`lower(coalesce(${products.variant}, '')) = lower(${input.variant ?? ''})`
  )
}

function duplicatedMessage(input: Pick<CreateProductSchema, 'name'>) {
  return `Já existe um produto igual a "${input.name}" (mesmo nome e variação)`
}

/**
 * Monta o snapshot da composição com o custo ATUAL dos materiais.
 * Rejeita material inexistente ou de outra organização.
 */
async function buildComposition(
  tx: Tx,
  organizationId: string,
  items: { materialId: string; quantity: number }[]
) {
  if (items.length === 0) return { lines: [], materialCost: 0 }

  const rows = await tx
    .select({ id: materials.id, unitCost: materials.unitCost })
    .from(materials)
    .where(
      and(
        inArray(
          materials.id,
          items.map(i => i.materialId)
        ),
        eq(materials.organizationId, organizationId)
      )
    )
  const costById = new Map(rows.map(r => [r.id, r.unitCost]))

  const lines = items.map(item => {
    const unitCost = costById.get(item.materialId)
    if (unitCost === undefined) throw new Error('Material inválido')
    return {
      materialId: item.materialId,
      quantity: item.quantity,
      unitCost,
      totalCost: calcMaterialLineCost(unitCost, item.quantity),
    }
  })

  return {
    lines,
    materialCost: round2(lines.reduce((acc, l) => acc + l.totalCost, 0)),
  }
}

function pricingFields(
  input: {
    laborMinutes: number
    hourlyRate: number
    marginType: MarginType
    marginValue: number
  },
  materialCost: number
) {
  const laborCost = calcLaborCost(input.laborMinutes, input.hourlyRate)
  const salePrice = calcSalePrice({
    materialCost,
    laborCost,
    marginType: input.marginType,
    marginValue: input.marginValue,
  })
  if (Number.isNaN(salePrice)) throw new Error('Margem inválida')
  return { materialCost, laborCost, salePrice }
}

export async function createProduct(input: CreateProductSchema) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem criar produtos')

    const existing = await db.query.products.findFirst({
      where: sameIdentity(organizationId, input),
      columns: { id: true },
    })
    if (existing) throw new Error(duplicatedMessage(input))

    const data = await db.transaction(async tx => {
      const { lines, materialCost } = await buildComposition(
        tx,
        organizationId,
        input.materials
      )
      const { materials: _items, ...fields } = input

      const product = await tx
        .insert(products)
        .values({
          ...fields,
          organizationId,
          ...pricingFields(input, materialCost),
        })
        .returning()
        .then(takeFirstOrThrow)

      if (lines.length)
        await tx
          .insert(productMaterials)
          .values(lines.map(l => ({ ...l, productId: product.id })))

      return product
    })

    revalidateProductsCache()

    return { data, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateProduct({
  id,
  ...input
}: UpdateProductSchema & { id: string }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem editar produtos')

    const duplicated = await db.query.products.findFirst({
      where: and(sameIdentity(organizationId, input), ne(products.id, id)),
      columns: { id: true },
    })
    if (duplicated) throw new Error(duplicatedMessage(input))

    await db.transaction(async tx => {
      const owned = await tx
        .select({ id: products.id })
        .from(products)
        .where(
          and(eq(products.id, id), eq(products.organizationId, organizationId))
        )
        .then(rows => takeFirstOrThrow(rows, 'Produto não encontrado!'))

      const { lines, materialCost } = await buildComposition(
        tx,
        organizationId,
        input.materials
      )
      const { materials: _items, ...fields } = input

      await tx
        .update(products)
        .set({ ...fields, ...pricingFields(input, materialCost) })
        .where(eq(products.id, owned.id))

      await tx
        .delete(productMaterials)
        .where(eq(productMaterials.productId, owned.id))
      if (lines.length)
        await tx
          .insert(productMaterials)
          .values(lines.map(l => ({ ...l, productId: owned.id })))
    })

    revalidateProductsCache()
    revalidatePath(`/products/${id}`)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/**
 * Recálculo EXPLÍCITO: atualiza o snapshot da composição com os custos atuais
 * dos materiais e refaz custo/preço. Nada disso acontece automaticamente.
 */
export async function recalculateProduct(input: { id: string }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem recalcular produtos')

    await db.transaction(async tx => {
      const product = await tx
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, input.id),
            eq(products.organizationId, organizationId)
          )
        )
        .then(rows => takeFirstOrThrow(rows, 'Produto não encontrado!'))

      const current = await tx
        .select({
          materialId: productMaterials.materialId,
          quantity: productMaterials.quantity,
        })
        .from(productMaterials)
        .where(eq(productMaterials.productId, product.id))

      const { lines, materialCost } = await buildComposition(
        tx,
        organizationId,
        current
      )

      await tx
        .update(products)
        .set(pricingFields(product, materialCost))
        .where(eq(products.id, product.id))

      for (const line of lines)
        await tx
          .update(productMaterials)
          .set({ unitCost: line.unitCost, totalCost: line.totalCost })
          .where(
            and(
              eq(productMaterials.productId, product.id),
              eq(productMaterials.materialId, line.materialId)
            )
          )
    })

    revalidateProductsCache()
    revalidatePath(`/products/${input.id}`)

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function deleteProduct(input: { id: string }) {
  return deleteProducts({ ids: [input.id] })
}

export async function deleteProducts(input: { ids: string[] }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem excluir produtos')

    const usedProducts = await db.query.orderItems.findMany({
      where: (fields, { inArray }) => inArray(fields.productId, input.ids),
      columns: { productId: true },
    })

    if (usedProducts.length > 0) {
      const usedIds = new Set(usedProducts.map(p => p.productId))

      throw new Error(
        `Não é possível excluir ${usedIds.size > 1 ? `${usedIds.size} produtos` : '1 produto'}; ` +
          `${usedIds.size > 1 ? 'estão vinculados a serviços' : 'está vinculado a um serviço'}.`
      )
    }

    await db
      .delete(products)
      .where(
        and(
          inArray(products.id, input.ids),
          eq(products.organizationId, organizationId)
        )
      )

    revalidateProductsCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
