import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import { getSortingStateParser } from '@/lib/data-table-parsers'
import { isValidCnpj, isValidCpf } from '@/lib/documents'
import { z } from '@/lib/z'
import type { clients } from '../schema'
import { personTypeEnum } from '../schema/enums'

// colunas permitidas em ?sort= (ids de coluna da tabela)
export const sortableClientColumns = [
  'legalName',
  'personType',
  'city',
  'createdAt',
] as const

export type SortableClientColumn = (typeof sortableClientColumns)[number]

export const searchParamsCacheClients = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  legalName: parseAsString.withDefault(''),
  personType: parseAsArrayOf(
    parseAsStringLiteral(personTypeEnum.enumValues)
  ).withDefault([]),
  sort: getSortingStateParser<SortableClientColumn>(
    sortableClientColumns
  ).withDefault([{ id: 'legalName', desc: false }]),
})

const emptyToUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess(value => {
    if (typeof value === 'string' && value.trim() === '') return undefined
    return value
  }, schema.optional())

export type GetClientsSchema = Awaited<
  ReturnType<typeof searchParamsCacheClients.parse>
>

// O form guarda tudo como string ('' = vazio). Aqui '' vira undefined, então o
// tipo de entrada continua string (bom para o react-hook-form).
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform(value => value || undefined)
    .optional()

const clientFields = {
  legalName: z.string().trim().min(2).max(160),
  tradeName: optionalText(160),
  contactName: optionalText(160),
  email: z
    .union([z.literal(''), z.email()])
    .transform(value => value || undefined)
    .optional(),
  phone: emptyToUndefined(
    z
      .string()
      .trim()
      .refine(v => v.length >= 10 && v.length <= 11, 'Telefone inválido')
  ),
  personType: z.enum(personTypeEnum.enumValues),
  // a máscara do form já entrega o documento sem pontuação
  cpf: optionalText(11),
  cnpj: optionalText(14),
  stateRegistration: optionalText(30),
  street: optionalText(160),
  neighborhood: optionalText(120),
  addressNumber: z
    .string()
    .trim()
    .refine(
      value => !value || Number.isInteger(Number(value)),
      'Número inválido'
    )
    .transform(value => (value ? Number(value) : undefined))
    .optional(),
  complement: optionalText(160),
  city: optionalText(40),
  state: z
    .string()
    .trim()
    .refine(value => value === '' || value.length === 2, 'Use a sigla da UF')
    .transform(value => value.toUpperCase() || undefined)
    .optional(),
  zipCode: z
    .string()
    .trim()
    .refine(value => value === '' || value.length === 8, 'CEP inválido')
    .transform(value => value || undefined)
    .optional(),
}

// valida o documento do tipo escolhido e descarta o do outro tipo
function refineAndNormalize(schema: z.ZodObject<typeof clientFields>) {
  return schema
    .superRefine((client, ctx) => {
      if (client.personType === 'individual' && client.cpf) {
        if (!isValidCpf(client.cpf))
          ctx.addIssue({
            code: 'custom',
            path: ['cpf'],
            message: 'CPF inválido',
          })
      }
      if (client.personType === 'company' && client.cnpj) {
        if (!isValidCnpj(client.cnpj))
          ctx.addIssue({
            code: 'custom',
            path: ['cnpj'],
            message: 'CNPJ inválido',
          })
      }
    })
    .transform(client => ({
      ...client,
      cpf: client.personType === 'individual' ? client.cpf : undefined,
      cnpj: client.personType === 'company' ? client.cnpj : undefined,
      tradeName: client.personType === 'company' ? client.tradeName : undefined,
      stateRegistration:
        client.personType === 'company' ? client.stateRegistration : undefined,
    }))
}

export const createClientSchema = refineAndNormalize(z.object(clientFields))

export const updateClientSchema = refineAndNormalize(z.object(clientFields))

export type CreateClientInput = z.input<typeof createClientSchema>
export type CreateClientSchema = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.input<typeof updateClientSchema>
export type UpdateClientSchema = z.infer<typeof updateClientSchema>
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
