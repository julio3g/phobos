'use server'

import { and, eq, inArray, isNull, ne, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { connection } from 'next/server'
import { getErrorMessage } from '@/lib/handle-error'
import { db } from '../connection'
import { requireSession } from '../queries'
import { materials, productMaterials } from '../schema'
import { takeFirstOrThrow } from '../utils'
import type { CreateMaterialSchema, UpdateMaterialSchema } from '../validators'

function revalidateMaterialsCache() {
  revalidateTag('materials', 'max')
  revalidatePath('/materials')
}

// mesma identidade do índice único materials_identity_unique
function sameIdentity(
  organizationId: string,
  input: Pick<CreateMaterialSchema, 'name' | 'brand' | 'variant'>
) {
  return and(
    eq(materials.organizationId, organizationId),
    sql`lower(${materials.name}) = lower(${input.name})`,
    sql`lower(coalesce(${materials.brand}, '')) = lower(${input.brand ?? ''})`,
    sql`lower(coalesce(${materials.variant}, '')) = lower(${input.variant ?? ''})`
  )
}

/** Material usado em produto não pode ser excluído (FK restrict): arquivar. */
async function assertNotUsed(ids: string[]) {
  const used = await db
    .selectDistinct({ id: productMaterials.materialId })
    .from(productMaterials)
    .where(inArray(productMaterials.materialId, ids))
  if (used.length > 0)
    throw new Error(
      `${used.length > 1 ? 'Materiais estão' : 'Material está'} em uso na composição de produtos; arquive em vez de excluir.`
    )
}

function duplicatedMessage(input: Pick<CreateMaterialSchema, 'name'>) {
  return `Já existe um material igual a "${input.name}" (mesmo nome, marca e variação)`
}

export async function createMaterial(input: CreateMaterialSchema) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem criar materiais')

    const existing = await db.query.materials.findFirst({
      where: sameIdentity(organizationId, input),
      columns: { id: true },
    })
    if (existing) throw new Error(duplicatedMessage(input))

    // unitCost é gerado pelo banco (packagePrice / packageQuantity)
    const data = await db
      .insert(materials)
      .values({ ...input, organizationId })
      .returning()
      .then(takeFirstOrThrow)

    revalidateMaterialsCache()

    return { data, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateMaterial({
  id,
  ...input
}: UpdateMaterialSchema & { id: string }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem editar materiais')

    const duplicated = await db.query.materials.findFirst({
      where: and(sameIdentity(organizationId, input), ne(materials.id, id)),
      columns: { id: true },
    })
    if (duplicated) throw new Error(duplicatedMessage(input))

    await db
      .update(materials)
      .set(input)
      .where(
        and(eq(materials.id, id), eq(materials.organizationId, organizationId))
      )
      .returning({ id: materials.id })
      .then(rows => takeFirstOrThrow(rows, 'Material não encontrado!'))

    revalidateMaterialsCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Arquiva (esconde da lista) ou restaura um material, sem apagar. */
export async function archiveMaterial(input: {
  id: string
  archived: boolean
}) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem arquivar materiais')

    await db
      .update(materials)
      .set({ archivedAt: input.archived ? new Date() : null })
      .where(
        and(
          eq(materials.id, input.id),
          eq(materials.organizationId, organizationId),
          input.archived ? isNull(materials.archivedAt) : undefined
        )
      )
      .returning({ id: materials.id })
      .then(rows => takeFirstOrThrow(rows, 'Material não encontrado!'))

    revalidateMaterialsCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function deleteMaterial(input: { id: string }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem excluir materiais')

    await assertNotUsed([input.id])

    await db
      .delete(materials)
      .where(
        and(
          eq(materials.id, input.id),
          eq(materials.organizationId, organizationId)
        )
      )

    revalidateMaterialsCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function deleteMaterials(input: { ids: string[] }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem excluir materiais')

    await assertNotUsed(input.ids)

    await db
      .delete(materials)
      .where(
        and(
          inArray(materials.id, input.ids),
          eq(materials.organizationId, organizationId)
        )
      )

    revalidateMaterialsCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
