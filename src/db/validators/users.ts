import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import { getSortingStateParser } from '@/lib/data-table-parsers'
import { z } from '@/lib/z'
import { userRoleEnum } from '../schema/enums'

export const sortableUserColumns = [
  'name',
  'email',
  'role',
  'createdAt',
] as const

export type SortableUserColumn = (typeof sortableUserColumns)[number]

export const searchParamsCacheUsers = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString.withDefault(''),
  role: parseAsArrayOf(
    parseAsStringLiteral(userRoleEnum.enumValues)
  ).withDefault([]),
  sort: getSortingStateParser<SortableUserColumn>(
    sortableUserColumns
  ).withDefault([{ id: 'name', desc: false }]),
})

export type GetUsersSchema = Awaited<
  ReturnType<typeof searchParamsCacheUsers.parse>
>

// owner não é atribuível: nasce com a organização
const assignableRole = z.enum(['admin', 'member'])

const password = z
  .string()
  .min(8, { error: 'A senha deve ter ao menos 8 caracteres' })

const profileFields = {
  name: z.string().trim().min(1, { error: 'Nome é obrigatório' }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, { error: 'Usuário deve ter ao menos 3 caracteres' })
    .regex(/^[a-z0-9._-]+$/, {
      error: 'Use apenas letras, números, ponto, hífen ou underline',
    }),
  email: z.email({ error: 'E-mail inválido' }).trim().toLowerCase(),
  imageUrl: z.url({ error: 'URL inválida' }).optional(),
}

export const createUserSchema = z.object({
  ...profileFields,
  password,
  role: assignableRole.default('member'),
})

export const updateUserSchema = z.object(profileFields)

// role é opcional: o proprietário não tem permissão editável
export const updateUserFormSchema = z.object({
  ...profileFields,
  role: assignableRole.optional(),
})

export const updateMemberRoleSchema = z.object({ role: assignableRole })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: 'Senha atual é obrigatória' }),
    newPassword: password,
  })
  .refine(v => v.currentPassword !== v.newPassword, {
    error: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  })

export type CreateUserSchema = z.infer<typeof createUserSchema>
export type CreateUserInput = z.input<typeof createUserSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
export type UpdateUserFormInput = z.input<typeof updateUserFormSchema>
export type UpdateUserFormSchema = z.infer<typeof updateUserFormSchema>
export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
