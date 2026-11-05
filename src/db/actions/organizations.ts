'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { connection } from 'next/server'
import { getErrorMessage } from '@/lib/handle-error'
import { generateId } from '@/lib/id'
import { slugify } from '@/lib/slug'
import { db } from '../connection'
import { requireSession } from '../queries'
import { members, organizations } from '../schema'
import { takeFirstOrThrow } from '../utils'
import type {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
} from '../validators'

async function uniqueSlug(name: string) {
  const base = slugify(name, { lower: true, strict: true, locale: 'pt' })
  if (!base) throw new Error('Nome inválido para gerar o endereço da empresa')

  const taken = await db.query.organizations.findFirst({
    where: eq(organizations.slug, base),
    columns: { id: true },
  })

  return taken ? `${base}-${generateId().slice(0, 4).toLowerCase()}` : base
}

/** Cria a organização e vincula o usuário logado como owner. */
export async function createOrganization(input: CreateOrganizationSchema) {
  await connection()
  const { userId } = await requireSession()
  try {
    const slug = await uniqueSlug(input.name)

    const data = await db.transaction(async tx => {
      const organization = await tx
        .insert(organizations)
        .values({ name: input.name, slug })
        .returning()
        .then(takeFirstOrThrow)

      await tx
        .insert(members)
        .values({ organizationId: organization.id, userId, role: 'owner' })

      return organization
    })

    revalidatePath('/', 'layout')

    return { data, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

/** Edita a organização do usuário logado. Slug não muda (quebraria URLs). */
export async function updateOrganization(input: UpdateOrganizationSchema) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem editar a empresa')

    await db
      .update(organizations)
      .set({
        name: input.name,
        currency: input.currency,
        defaultHourlyRate: input.defaultHourlyRate,
      })
      .where(eq(organizations.id, organizationId))
      .returning({ id: organizations.id })
      .then(rows => takeFirstOrThrow(rows, 'Empresa não encontrada!'))

    revalidatePath('/', 'layout')

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
