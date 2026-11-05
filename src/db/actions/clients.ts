'use server'

import { and, eq, ne, or } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { connection } from 'next/server'
import { getErrorMessage } from '@/lib/handle-error'
import { db } from '../connection'
import { requireSession } from '../queries'
import { clients } from '../schema'
import { takeFirstOrThrow } from '../utils'
import type { CreateClientSchema, UpdateClientSchema } from '../validators'

function revalidateClientsCache() {
  revalidateTag('clients', 'max')
  revalidatePath('/clients')
}

// Os índices únicos de cpf/cnpj são globais (não por organização): a checagem
// também é global, para devolver mensagem amigável em vez do erro do banco.
async function assertUniqueDocument(
  input: Pick<CreateClientSchema, 'cpf' | 'cnpj'>,
  ignoreId?: string
) {
  const sameDocument = or(
    input.cpf ? eq(clients.cpf, input.cpf) : undefined,
    input.cnpj ? eq(clients.cnpj, input.cnpj) : undefined
  )
  if (!sameDocument) return

  const existing = await db.query.clients.findFirst({
    where: and(sameDocument, ignoreId ? ne(clients.id, ignoreId) : undefined),
    columns: { id: true },
  })

  if (existing)
    throw new Error(`Já existe um cliente com este ${input.cpf ? 'CPF' : 'CNPJ'}`)
}

export async function createClient(input: CreateClientSchema) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem criar clientes')

    await assertUniqueDocument(input)

    const data = await db
      .insert(clients)
      .values({ ...input, organizationId })
      .returning()
      .then(rows => takeFirstOrThrow(rows, 'Falha ao adicionar cliente'))

    revalidateClientsCache()

    return { data, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function updateClient({
  id,
  ...input
}: UpdateClientSchema & { id: string }) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem editar clientes')

    await assertUniqueDocument(input, id)

    // `set` ignora undefined: campos esvaziados no form precisam virar null
    await db
      .update(clients)
      .set({
        legalName: input.legalName,
        tradeName: input.tradeName ?? null,
        contactName: input.contactName ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        personType: input.personType,
        cpf: input.cpf ?? null,
        cnpj: input.cnpj ?? null,
        stateRegistration: input.stateRegistration ?? null,
        street: input.street ?? null,
        neighborhood: input.neighborhood ?? null,
        addressNumber: input.addressNumber ?? null,
        complement: input.complement ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        zipCode: input.zipCode ?? null,
      })
      .where(and(eq(clients.id, id), eq(clients.organizationId, organizationId)))
      .returning({ id: clients.id })
      .then(rows => takeFirstOrThrow(rows, 'Cliente não encontrado!'))

    revalidateClientsCache()

    return { data: null, error: null }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
