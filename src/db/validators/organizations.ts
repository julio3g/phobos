import { z } from '@/lib/z'

export const currencies = ['BRL', 'USD', 'EUR'] as const

const organizationFields = {
  name: z.string().trim().min(1, { error: 'Nome é obrigatório' }),
  currency: z.enum(currencies, { error: 'Moeda inválida' }).default('BRL'),
  defaultHourlyRate: z.coerce
    .number<number>()
    .nonnegative({ error: 'Valor/hora não pode ser negativo' })
    .default(0),
}

export const createOrganizationSchema = z.object({
  name: organizationFields.name,
})

export const updateOrganizationSchema = z.object(organizationFields)

export const signUpSchema = z.object({
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
  password: z
    .string()
    .min(8, { error: 'A senha deve ter ao menos 8 caracteres' }),
  organizationName: z
    .string()
    .trim()
    .min(1, { error: 'Nome do negócio é obrigatório' }),
})

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.input<typeof updateOrganizationSchema>
export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
