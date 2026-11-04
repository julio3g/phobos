import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'
import { unitEnum } from '@/db/schema/enums'
import { getSortingStateParser } from '@/lib/data-table-parsers'
import { z } from '@/lib/z'

export const sortableMaterialColumns = [
  'name',
  'brand',
  'variant',
  'unitCost',
  'createdAt',
] as const

export type SortableMaterialColumn = (typeof sortableMaterialColumns)[number]

export const searchParamsCacheMaterials = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString.withDefault(''),
  archived: parseAsBoolean.withDefault(false),
  sort: getSortingStateParser<SortableMaterialColumn>(
    sortableMaterialColumns
  ).withDefault([{ id: 'name', desc: false }]),
})

export type GetMaterialsSchema = Awaited<
  ReturnType<typeof searchParamsCacheMaterials.parse>
>

const materialFields = {
  name: z.string().trim().min(1, { error: 'Nome é obrigatório' }),
  brand: z.string().trim().optional(),
  variant: z.string().trim().optional(),
  imageUrl: z.url({ error: 'URL inválida' }).optional(),
  purchaseUrl: z.url({ error: 'URL inválida' }).optional(),
  unit: z.enum(unitEnum.enumValues, { error: 'Unidade é obrigatória' }),
  packagePrice: z.coerce
    .number<number>()
    .nonnegative({ error: 'Preço não pode ser negativo' }),
  packageQuantity: z.coerce
    .number<number>()
    .positive({ error: 'Quantidade deve ser maior que zero' }),
}

export const createMaterialSchema = z.object(materialFields)

export const updateMaterialSchema = z.object(materialFields)

export type CreateMaterialInput = z.input<typeof createMaterialSchema>
export type CreateMaterialSchema = z.infer<typeof createMaterialSchema>
export type UpdateMaterialSchema = z.infer<typeof updateMaterialSchema>
